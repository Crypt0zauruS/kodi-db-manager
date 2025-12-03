use sqlx::{MySql, Pool};
use crate::models::{DatabaseConfig, Movie};
use anyhow::Result;

pub type DbPool = Pool<MySql>;

pub async fn create_pool(config: &DatabaseConfig) -> Result<DbPool> {
    let connection_string = format!(
        "mysql://{}:{}@{}:{}/{}",
        config.user, config.password, config.host, config.port, config.database
    );

    let pool = sqlx::mysql::MySqlPoolOptions::new()
        .max_connections(10)
        .connect(&connection_string)
        .await?;

    Ok(pool)
}

pub async fn get_movies(pool: &DbPool) -> Result<Vec<Movie>> {
    let movies = sqlx::query_as::<_, Movie>(
        "SELECT idMovie, c00, c01, c05, c07, c08, c12, c14, c15, c16, c18, c19, c20, c21, c22, premiered 
         FROM movie 
         ORDER BY c00"
    )
    .fetch_all(pool)
    .await?;

    Ok(movies)
}

pub async fn get_movie_by_id(pool: &DbPool, id: i32) -> Result<Option<Movie>> {
    let movie = sqlx::query_as::<_, Movie>(
        "SELECT idMovie, c00, c01, c05, c07, c08, c12, c14, c15, c16, c18, c19, c20, c21, c22, premiered 
         FROM movie 
         WHERE idMovie = ?"
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(movie)
}

pub async fn search_movies(pool: &DbPool, query: &str) -> Result<Vec<Movie>> {
    let search_pattern = format!("%{}%", query);
    let movies = sqlx::query_as::<_, Movie>(
        "SELECT idMovie, c00, c01, c05, c07, c08, c12, c14, c15, c16, c18, c19, c20, c21, c22, premiered 
         FROM movie 
         WHERE c00 LIKE ? OR c16 LIKE ?
         ORDER BY c00"
    )
    .bind(&search_pattern)
    .bind(&search_pattern)
    .fetch_all(pool)
    .await?;

    Ok(movies)
}

pub async fn test_connection(pool: &DbPool) -> Result<bool> {
    sqlx::query("SELECT 1")
        .execute(pool)
        .await?;
    Ok(true)
}
