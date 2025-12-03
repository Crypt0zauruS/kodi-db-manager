use serde::{Deserialize, Serialize};
use reqwest::Client;

const TMDB_BASE_URL: &str = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE: &str = "https://image.tmdb.org/t/p";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TmdbMovie {
    pub id: i32,
    pub title: String,
    pub original_title: String,
    pub overview: Option<String>,
    pub release_date: Option<String>,
    pub poster_path: Option<String>,
    pub backdrop_path: Option<String>,
    pub vote_average: Option<f32>,
    pub genre_ids: Vec<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TmdbSearchResponse {
    pub page: i32,
    pub results: Vec<TmdbMovie>,
    pub total_pages: i32,
    pub total_results: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TmdbMovieDetails {
    pub id: i32,
    pub title: String,
    pub original_title: String,
    pub overview: Option<String>,
    pub release_date: Option<String>,
    pub poster_path: Option<String>,
    pub backdrop_path: Option<String>,
    pub vote_average: Option<f32>,
    pub runtime: Option<i32>,
    pub genres: Vec<TmdbGenre>,
    pub production_companies: Vec<TmdbCompany>,
    pub production_countries: Vec<TmdbCountry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TmdbGenre {
    pub id: i32,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TmdbCompany {
    pub id: i32,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TmdbCountry {
    pub iso_3166_1: String,
    pub name: String,
}

pub struct TmdbClient {
    client: Client,
    api_key: String,
}

impl TmdbClient {
    pub fn new(api_key: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
        }
    }

    pub async fn search_movie(&self, query: &str, language: &str) -> Result<TmdbSearchResponse, String> {
        let url = format!("{}/search/movie", TMDB_BASE_URL);
        
        let response = self.client
            .get(&url)
            .query(&[
                ("api_key", self.api_key.as_str()),
                ("query", query),
                ("language", language),
            ])
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !response.status().is_success() {
            return Err(format!("TMDB API error: {}", response.status()));
        }

        response
            .json::<TmdbSearchResponse>()
            .await
            .map_err(|e| e.to_string())
    }

    pub async fn get_movie_details(&self, movie_id: i32, language: &str) -> Result<TmdbMovieDetails, String> {
        let url = format!("{}/movie/{}", TMDB_BASE_URL, movie_id);
        
        let response = self.client
            .get(&url)
            .query(&[
                ("api_key", self.api_key.as_str()),
                ("language", language),
            ])
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !response.status().is_success() {
            return Err(format!("TMDB API error: {}", response.status()));
        }

        response
            .json::<TmdbMovieDetails>()
            .await
            .map_err(|e| e.to_string())
    }

    pub fn get_image_url(&self, path: &str, size: &str) -> String {
        format!("{}/{}{}", TMDB_IMAGE_BASE, size, path)
    }
}

// Tauri commands for TMDB
#[tauri::command]
pub async fn tmdb_search_movie(
    query: String,
    api_key: String,
    language: Option<String>,
) -> Result<TmdbSearchResponse, String> {
    let client = TmdbClient::new(api_key);
    let lang = language.unwrap_or_else(|| "en-US".to_string());
    client.search_movie(&query, &lang).await
}

#[tauri::command]
pub async fn tmdb_get_movie_details(
    movie_id: i32,
    api_key: String,
    language: Option<String>,
) -> Result<TmdbMovieDetails, String> {
    let client = TmdbClient::new(api_key);
    let lang = language.unwrap_or_else(|| "en-US".to_string());
    client.get_movie_details(movie_id, &lang).await
}
