mod commands;
mod config;
mod database;
mod models;
mod tmdb;

use config::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let app_state = AppState::new();

  tauri::Builder::default()
    .manage(app_state)
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      commands::get_movies,
      commands::get_movie_by_id,
      commands::search_movies,
      commands::connect_database,
      commands::test_database_connection,
      commands::get_config,
      commands::update_config,
      tmdb::tmdb_search_movie,
      tmdb::tmdb_get_movie_details,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
