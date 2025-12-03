use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Movie {
    #[sqlx(rename = "idMovie")]
    #[serde(rename = "idMovie")]
    pub id_movie: i32,
    pub c00: String,
    pub c01: Option<String>,
    pub c05: Option<String>,
    pub c07: Option<String>,
    pub c08: Option<String>,
    pub c12: Option<String>,
    pub c14: Option<String>,
    pub c15: Option<String>,
    pub c16: Option<String>,
    pub c18: Option<String>,
    pub c19: Option<String>,
    pub c20: Option<String>,
    pub c21: Option<String>,
    pub c22: Option<String>,
    pub premiered: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub host: String,
    pub port: u16,
    pub user: String,
    pub password: String,
    pub database: String,
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            host: "192.168.0.10".to_string(),
            port: 3306,
            user: "xbmc".to_string(),
            password: "xbmc".to_string(),
            database: "MyVideos121".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TmdbConfig {
    pub api_key: String,
    pub language: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub database: DatabaseConfig,
    pub tmdb: Option<TmdbConfig>,
    pub locale: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            database: DatabaseConfig::default(),
            tmdb: None,
            locale: "en".to_string(),
        }
    }
}
