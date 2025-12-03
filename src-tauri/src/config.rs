use crate::models::AppConfig;
use anyhow::Result;
use std::sync::Mutex;

pub struct AppState {
    pub config: Mutex<AppConfig>,
    pub db_pool: Mutex<Option<crate::database::DbPool>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            config: Mutex::new(AppConfig::default()),
            db_pool: Mutex::new(None),
        }
    }
}

pub fn load_config() -> Result<AppConfig> {
    // For now, return default config
    // Later we'll use tauri-plugin-store to persist config
    Ok(AppConfig::default())
}

pub fn save_config(config: &AppConfig) -> Result<()> {
    // TODO: Implement with tauri-plugin-store
    Ok(())
}
