use crate::config::AppState;
use crate::database;
use crate::models::{AppConfig, DatabaseConfig, Movie};
use tauri::State;

#[tauri::command]
pub async fn get_movies(state: State<'_, AppState>) -> Result<Vec<Movie>, String> {
    let pool_guard = state.db_pool.lock().await;
    
    if let Some(pool) = pool_guard.as_ref() {
        database::get_movies(pool)
            .await
            .map_err(|e| e.to_string())
    } else {
        Err("Database not connected".to_string())
    }
}

#[tauri::command]
pub async fn get_movie_by_id(id: i32, state: State<'_, AppState>) -> Result<Option<Movie>, String> {
    let pool_guard = state.db_pool.lock().await;
    
    if let Some(pool) = pool_guard.as_ref() {
        database::get_movie_by_id(pool, id)
            .await
            .map_err(|e| e.to_string())
    } else {
        Err("Database not connected".to_string())
    }
}

#[tauri::command]
pub async fn search_movies(query: String, state: State<'_, AppState>) -> Result<Vec<Movie>, String> {
    let pool_guard = state.db_pool.lock().await;
    
    if let Some(pool) = pool_guard.as_ref() {
        database::search_movies(pool, &query)
            .await
            .map_err(|e| e.to_string())
    } else {
        Err("Database not connected".to_string())
    }
}

#[tauri::command]
pub async fn connect_database(config: DatabaseConfig, state: State<'_, AppState>) -> Result<bool, String> {
    let pool = database::create_pool(&config)
        .await
        .map_err(|e| e.to_string())?;
    
    // Test connection
    database::test_connection(&pool)
        .await
        .map_err(|e| e.to_string())?;
    
    // Store pool in state
    let mut pool_guard = state.db_pool.lock().await;
    *pool_guard = Some(pool);
    
    // Update config
    let mut config_guard = state.config.lock().await;
    config_guard.database = config;
    
    Ok(true)
}

#[tauri::command]
pub async fn test_database_connection(state: State<'_, AppState>) -> Result<bool, String> {
    let pool_guard = state.db_pool.lock().await;
    
    if let Some(pool) = pool_guard.as_ref() {
        database::test_connection(pool)
            .await
            .map_err(|e| e.to_string())
    } else {
        Err("Database not connected".to_string())
    }
}

#[tauri::command]
pub async fn get_config(state: State<'_, AppState>) -> Result<AppConfig, String> {
    let config_guard = state.config.lock().await;
    Ok(config_guard.clone())
}

#[tauri::command]
pub async fn update_config(config: AppConfig, state: State<'_, AppState>) -> Result<(), String> {
    let mut config_guard = state.config.lock().await;
    *config_guard = config;
    Ok(())
}
