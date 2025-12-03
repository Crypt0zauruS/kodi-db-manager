use serde::{Deserialize, Serialize};
use chrono::NaiveDateTime;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Movie {
    #[serde(rename = "idMovie")]
    pub id_movie: i32,
    #[serde(rename = "c00")]
    pub title: String,
    #[serde(rename = "c01")]
    pub plot: Option<String>,
    #[serde(rename = "c05")]
    pub rating: Option<f32>,
    #[serde(rename = "c07")]
    pub year: Option<String>,
    #[serde(rename = "c08")]
    pub thumbs: Option<String>,
    #[serde(rename = "c12")]
    pub mpaa: Option<String>,
    #[serde(rename = "c14")]
    pub genre: Option<String>,
    #[serde(rename = "c15")]
    pub director: Option<String>,
    #[serde(rename = "c16")]
    pub original_title: Option<String>,
    #[serde(rename = "c18")]
    pub studio: Option<String>,
    #[serde(rename = "c19")]
    pub trailer: Option<String>,
    #[serde(rename = "c20")]
    pub fanart: Option<String>,
    #[serde(rename = "c21")]
    pub country: Option<String>,
    #[serde(rename = "c22")]
    pub path: Option<String>,
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
