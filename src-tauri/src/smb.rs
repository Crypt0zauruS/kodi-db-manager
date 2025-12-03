use anyhow::{anyhow, Result};
use local_ip_address::local_ip;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::process::Stdio;
use tokio::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmbShare {
    pub id: String,
    pub host: String,
    pub share: String,
    pub username: Option<String>,
    pub password: Option<String>,
    pub domain: Option<String>,
    pub ip_address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmbHost {
    pub name: String,
    pub ip: String,
    pub workgroup: Option<String>,
}

/// Detect SMB/Samba shares on the local network
pub async fn detect_smb_shares() -> Result<Vec<SmbShare>> {
    let mut shares = Vec::new();

    // Get local IP to determine network
    let local_ip = local_ip().map_err(|e| anyhow!("Failed to get local IP: {}", e))?;

    // Detect OS and use appropriate method
    if cfg!(target_os = "macos") {
        // macOS: use dns-sd for mDNS/Bonjour discovery
        shares = scan_macos_network().await?;
    } else {
        // Linux: use nmblookup/smbclient
        let hosts = scan_network_hosts(&local_ip.to_string()).await?;

        // For each host, try to list shares
        for host in hosts {
            if let Ok(host_shares) = list_host_shares(&host.ip, &host.name).await {
                shares.extend(host_shares);
            }
        }
    }

    Ok(shares)
}

/// Scan macOS network using dns-sd (Bonjour/mDNS)
async fn scan_macos_network() -> Result<Vec<SmbShare>> {
    let mut shares = Vec::new();

    // Try multiple detection methods in parallel for robustness

    // Method 1: dns-sd (Bonjour/mDNS)
    let dns_sd_handle = tokio::spawn(async {
        let mut discovered_shares = Vec::new();

        if let Ok(child) = Command::new("dns-sd")
            .args(&["-B", "_smb._tcp", "local.", "-t", "5"])
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
        {
            let timeout_duration = std::time::Duration::from_secs(5);
            if let Ok(Ok(output)) = tokio::time::timeout(timeout_duration, child.wait_with_output()).await
            {
                let stdout = String::from_utf8_lossy(&output.stdout);

                for line in stdout.lines() {
                    if line.contains("Add") && line.contains("_smb._tcp") {
                        if let Some(hostname) = parse_dns_sd_line(line) {
                            if let Ok(host_shares) = get_macos_shares(&hostname).await {
                                discovered_shares.extend(host_shares);
                            }
                        }
                    }
                }
            }
        }

        discovered_shares
    });

    // Method 2: Try nmblookup if available (NetBIOS)
    let netbios_handle = tokio::spawn(async {
        scan_netbios_macos().await.unwrap_or_default()
    });

    // Method 3: Direct IP scanning
    let ip_scan_handle = tokio::spawn(async {
        scan_common_hosts_macos().await.unwrap_or_default()
    });

    // Collect results from all methods
    if let Ok(dns_shares) = dns_sd_handle.await {
        shares.extend(dns_shares);
    }

    if let Ok(netbios_shares) = netbios_handle.await {
        shares.extend(netbios_shares);
    }

    if let Ok(ip_shares) = ip_scan_handle.await {
        shares.extend(ip_shares);
    }

    // Deduplicate shares by host+share combination
    shares.sort_by(|a, b| {
        let key_a = format!("{}:{}", a.host, a.share);
        let key_b = format!("{}:{}", b.host, b.share);
        key_a.cmp(&key_b)
    });
    shares.dedup_by(|a, b| {
        a.host == b.host && a.share == b.share
    });

    Ok(shares)
}

/// Parse dns-sd output line to extract hostname
fn parse_dns_sd_line(line: &str) -> Option<String> {
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.len() > 6 {
        Some(parts[6].trim_end_matches('.').to_string())
    } else {
        None
    }
}

/// Get shares from a macOS host using smbutil
async fn get_macos_shares(hostname: &str) -> Result<Vec<SmbShare>> {
    let mut shares = Vec::new();

    // Use smbutil to list shares (guest access)
    let output = Command::new("smbutil")
        .args(&["view", "-g", &format!("//{}", hostname)])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    if let Ok(output) = output {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);

            // Try different parsing strategies
            for line in stdout.lines() {
                let line = line.trim();
                // Skip empty lines, headers, and separator lines (like "------")
                if line.is_empty() || line.starts_with("Share") || line.chars().all(|c| c == '-' || c.is_whitespace()) {
                    continue;
                }

                // Parse tab-separated or whitespace-separated
                let parts: Vec<&str> = if line.contains('\t') {
                    line.split('\t').filter(|s| !s.is_empty()).collect()
                } else {
                    line.split_whitespace().collect()
                };

                if parts.is_empty() {
                    continue;
                }

                let share_name = parts[0].to_string();

                // Skip administrative shares and IPC
                if share_name.ends_with('$') || share_name.eq_ignore_ascii_case("IPC") {
                    continue;
                }

                // Check if it's a disk share (either "Disk" keyword or just assume it's valid)
                let is_disk = parts.len() < 2 || parts.iter().any(|p| p.contains("Disk"));

                if is_disk {
                    shares.push(SmbShare {
                        id: uuid::Uuid::new_v4().to_string(),
                        host: hostname.to_string(),
                        share: share_name,
                        username: None,
                        password: None,
                        domain: None,
                        ip_address: hostname.to_string(),
                    });
                }
            }
        }
    }

    Ok(shares)
}

/// Scan common local hosts on macOS (fallback)
async fn scan_common_hosts_macos() -> Result<Vec<SmbShare>> {
    let mut all_shares = Vec::new();

    // Try common hostnames in parallel
    let common_names = vec!["nas", "server", "timecapsule", "storage"];
    let mut hostname_tasks = Vec::new();

    for name in common_names {
        let name = name.to_string();
        hostname_tasks.push(tokio::spawn(async move {
            get_macos_shares(&name).await.unwrap_or_default()
        }));
    }

    // Scan broader IP range in local network with parallel execution
    if let Ok(local_ip) = local_ip() {
        let ip_string = local_ip.to_string();
        let ip_parts: Vec<&str> = ip_string.split('.').collect();
        if ip_parts.len() == 4 {
            let network_prefix = format!("{}.{}.{}", ip_parts[0], ip_parts[1], ip_parts[2]);

            // Expanded IP range: common router/NAS IPs plus a broader scan
            let scan_ips = vec![
                1, 2, 3, 5, 10, 11, 20, 50, 100, 101, 150, 200, 254
            ];

            let mut ip_tasks = Vec::new();

            for ip_suffix in scan_ips {
                let ip = format!("{}.{}", network_prefix, ip_suffix);
                ip_tasks.push(tokio::spawn(async move {
                    // First check if SMB port is open before trying smbutil
                    if check_smb_port(&ip).await {
                        get_macos_shares(&ip).await.unwrap_or_default()
                    } else {
                        Vec::new()
                    }
                }));
            }

            // Collect IP scan results
            for task in ip_tasks {
                if let Ok(shares) = task.await {
                    all_shares.extend(shares);
                }
            }
        }
    }

    // Collect hostname scan results
    for task in hostname_tasks {
        if let Ok(shares) = task.await {
            all_shares.extend(shares);
        }
    }

    Ok(all_shares)
}

/// Scan network using NetBIOS on macOS (if nmblookup available)
async fn scan_netbios_macos() -> Result<Vec<SmbShare>> {
    let mut all_shares = Vec::new();

    // Check if nmblookup is available
    let check_nmblookup = Command::new("which")
        .arg("nmblookup")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .await;

    if check_nmblookup.is_ok() && check_nmblookup.unwrap().success() {
        // nmblookup is available, try to scan for workgroups
        let output = Command::new("nmblookup")
            .args(&["-M", "--", "-"])
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .output()
            .await;

        if let Ok(output) = output {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);

                // Parse nmblookup output for IPs
                for line in stdout.lines() {
                    if let Some(ip) = extract_ip_from_line(line) {
                        if let Ok(shares) = get_macos_shares(&ip).await {
                            all_shares.extend(shares);
                        }
                    }
                }
            }
        }
    }

    Ok(all_shares)
}

/// Extract IP address from nmblookup output line
fn extract_ip_from_line(line: &str) -> Option<String> {
    // nmblookup output format: "name<00> IP_ADDRESS"
    let parts: Vec<&str> = line.split_whitespace().collect();
    for part in parts {
        // Check if it looks like an IP address
        if part.matches('.').count() == 3 {
            let octets: Vec<&str> = part.split('.').collect();
            if octets.len() == 4 && octets.iter().all(|s| s.parse::<u8>().is_ok()) {
                return Some(part.to_string());
            }
        }
    }
    None
}

/// Scan network for SMB/NetBIOS hosts using nmblookup (Linux)
async fn scan_network_hosts(local_ip: &str) -> Result<Vec<SmbHost>> {
    let mut hosts = Vec::new();

    // Parse local IP to get network prefix
    let ip_parts: Vec<&str> = local_ip.split('.').collect();
    if ip_parts.len() != 4 {
        return Err(anyhow!("Invalid IP address format"));
    }

    let network_prefix = format!("{}.{}.{}", ip_parts[0], ip_parts[1], ip_parts[2]);

    // Try nmblookup first (NetBIOS name service lookup)
    match scan_with_nmblookup(&network_prefix).await {
        Ok(nmb_hosts) if !nmb_hosts.is_empty() => {
            hosts.extend(nmb_hosts);
        }
        _ => {
            // Fallback: simple ping scan on common SMB port
            hosts.extend(scan_with_ping(&network_prefix).await?);
        }
    }

    Ok(hosts)
}

/// Scan using nmblookup command
async fn scan_with_nmblookup(network_prefix: &str) -> Result<Vec<SmbHost>> {
    let mut hosts = Vec::new();

    // Try nmblookup -S (status lookup)
    for i in 1..255 {
        let ip = format!("{}.{}", network_prefix, i);

        match Command::new("nmblookup")
            .args(&["-A", &ip])
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
        {
            Ok(child) => {
                if let Ok(output) = tokio::time::timeout(
                    std::time::Duration::from_millis(500),
                    child.wait_with_output(),
                )
                .await
                {
                    if let Ok(output) = output {
                        if output.status.success() {
                            let stdout = String::from_utf8_lossy(&output.stdout);
                            if let Some(host) = parse_nmblookup_output(&stdout, &ip) {
                                hosts.push(host);
                            }
                        }
                    }
                }
            }
            Err(_) => continue,
        }
    }

    Ok(hosts)
}

/// Parse nmblookup output
fn parse_nmblookup_output(output: &str, ip: &str) -> Option<SmbHost> {
    let re = Regex::new(r"(\S+)\s+<00>").ok()?;

    for line in output.lines() {
        if let Some(caps) = re.captures(line) {
            if let Some(name) = caps.get(1) {
                let name_str = name.as_str().to_string();
                if !name_str.starts_with('.') && name_str != "__MSBROWSE__" {
                    return Some(SmbHost {
                        name: name_str,
                        ip: ip.to_string(),
                        workgroup: None,
                    });
                }
            }
        }
    }

    None
}

/// Fallback: scan using simple connectivity check
async fn scan_with_ping(network_prefix: &str) -> Result<Vec<SmbHost>> {
    let mut hosts = Vec::new();

    // Quick scan of common IPs (router, NAS devices usually have low IPs)
    let scan_ips = [1, 2, 3, 5, 10, 20, 100, 200, 254];

    for i in scan_ips {
        let ip = format!("{}.{}", network_prefix, i);

        if check_smb_port(&ip).await {
            hosts.push(SmbHost {
                name: ip.clone(),
                ip: ip.clone(),
                workgroup: None,
            });
        }
    }

    Ok(hosts)
}

/// Check if SMB port (445) is open
async fn check_smb_port(ip: &str) -> bool {
    use std::time::Duration;
    use tokio::net::TcpStream;
    use tokio::time::timeout;

    let addr = format!("{}:445", ip);
    timeout(Duration::from_millis(500), TcpStream::connect(addr))
        .await
        .is_ok()
}

/// List shares on a specific host using smbclient
async fn list_host_shares(ip: &str, hostname: &str) -> Result<Vec<SmbShare>> {
    let mut shares = Vec::new();

    // Try anonymous access first
    let output = Command::new("smbclient")
        .args(&["-L", ip, "-N", "-g"]) // -N: no password, -g: grepable output
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output()
        .await;

    if let Ok(output) = output {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            shares = parse_smbclient_output(&stdout, ip, hostname);
        }
    }

    Ok(shares)
}

/// Parse smbclient -L output
fn parse_smbclient_output(output: &str, ip: &str, hostname: &str) -> Vec<SmbShare> {
    let mut shares = Vec::new();
    let re = Regex::new(r"Disk\|([^|]+)\|").unwrap();

    for line in output.lines() {
        if let Some(caps) = re.captures(line) {
            if let Some(share_name) = caps.get(1) {
                let share = share_name.as_str().trim().to_string();

                // Skip administrative shares
                if !share.ends_with('$') && share != "IPC" {
                    shares.push(SmbShare {
                        id: uuid::Uuid::new_v4().to_string(),
                        host: hostname.to_string(),
                        share: share.clone(),
                        username: None,
                        password: None,
                        domain: None,
                        ip_address: ip.to_string(),
                    });
                }
            }
        }
    }

    shares
}

/// Test SMB connection with credentials
pub async fn test_smb_connection(
    host: &str,
    share: &str,
    username: Option<&str>,
    password: Option<&str>,
    domain: Option<&str>,
) -> Result<bool> {
    if cfg!(target_os = "macos") {
        test_smb_connection_macos(host, share, username, password, domain).await
    } else {
        test_smb_connection_linux(host, share, username, password, domain).await
    }
}

/// Test SMB connection on macOS using smbutil
async fn test_smb_connection_macos(
    host: &str,
    share: &str,
    username: Option<&str>,
    password: Option<&str>,
    _domain: Option<&str>,
) -> Result<bool> {
    let smb_url = if let Some(user) = username {
        if let Some(pass) = password {
            format!("smb://{}:{}@{}/{}", user, pass, host, share)
        } else {
            format!("smb://{}@{}/{}", user, host, share)
        }
    } else {
        // Guest mode
        format!("smb://guest@{}/{}", host, share)
    };

    // Try to stat the share (lightweight test)
    let output = Command::new("smbutil")
        .args(&["statshares", &smb_url])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .output()
        .await?;

    Ok(output.status.success())
}

/// Test SMB connection on Linux using smbclient
async fn test_smb_connection_linux(
    host: &str,
    share: &str,
    username: Option<&str>,
    password: Option<&str>,
    domain: Option<&str>,
) -> Result<bool> {
    let mut args = vec![format!("//{}/{}", host, share)];

    // Handle guest mode vs authenticated
    if let Some(user) = username {
        if !user.is_empty() && user.to_lowercase() != "guest" {
            args.push("-U".to_string());
            if let Some(dom) = domain {
                args.push(format!("{}/{}", dom, user));
            } else {
                args.push(user.to_string());
            }
        } else {
            // Guest mode
            args.push("-N".to_string());
        }
    } else {
        // No username = guest mode
        args.push("-N".to_string());
    }

    args.push("-c".to_string());
    args.push("ls".to_string());

    let mut cmd = Command::new("smbclient");
    cmd.args(&args).stdout(Stdio::null()).stderr(Stdio::null());

    // If password provided and not guest, pass via stdin
    if let Some(pass) = password {
        if !pass.is_empty() {
            cmd.stdin(Stdio::piped());
            let mut child = cmd.spawn()?;

            if let Some(mut stdin) = child.stdin.take() {
                use tokio::io::AsyncWriteExt;
                let _ = stdin.write_all(pass.as_bytes()).await;
                let _ = stdin.write_all(b"\n").await;
            }

            let output = child.wait().await?;
            return Ok(output.success());
        }
    }

    let output = cmd.output().await?;
    Ok(output.status.success())
}

/// Mount SMB share (requires root/sudo or fuse)
pub async fn mount_smb_share(
    host: &str,
    share: &str,
    mount_point: &str,
    username: Option<&str>,
    password: Option<&str>,
    domain: Option<&str>,
) -> Result<()> {
    // Create mount point if it doesn't exist
    tokio::fs::create_dir_all(mount_point).await?;

    let mut args = vec![
        format!("//{}/{}", host, share),
        mount_point.to_string(),
    ];

    if let Some(user) = username {
        args.push(format!("username={}", user));
    } else {
        args.push("guest".to_string());
    }

    if let Some(pass) = password {
        args.push(format!("password={}", pass));
    }

    if let Some(dom) = domain {
        args.push(format!("domain={}", dom));
    }

    let output = Command::new("mount")
        .args(&["-t", "cifs"])
        .args(&args)
        .output()
        .await?;

    if output.status.success() {
        Ok(())
    } else {
        Err(anyhow!(
            "Mount failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}
