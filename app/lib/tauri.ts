import { invoke } from '@tauri-apps/api/core';

export interface Movie {
  idMovie: number;
  c00: string; // title
  c01?: string; // plot
  c05?: number; // rating
  c07?: string; // year
  c08?: string; // thumbs
  c12?: string; // mpaa
  c14?: string; // genre
  c15?: string; // director
  c16?: string; // original_title
  c18?: string; // studio
  c19?: string; // trailer
  c20?: string; // fanart
  c21?: string; // country
  c22?: string; // path
  premiered?: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface TmdbConfig {
  api_key: string;
  language: string;
}

export interface AppConfig {
  database: DatabaseConfig;
  tmdb?: TmdbConfig;
  locale: string;
}

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview?: string;
  release_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  genre_ids: number[];
}

export interface TmdbSearchResponse {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
}

// Database commands
export async function getMovies(): Promise<Movie[]> {
  return await invoke<Movie[]>('get_movies');
}

export async function getMovieById(id: number): Promise<Movie | null> {
  return await invoke<Movie | null>('get_movie_by_id', { id });
}

export async function searchMovies(query: string): Promise<Movie[]> {
  return await invoke<Movie[]>('search_movies', { query });
}

export async function connectDatabase(config: DatabaseConfig): Promise<boolean> {
  return await invoke<boolean>('connect_database', { config });
}

export async function testDatabaseConnection(): Promise<boolean> {
  return await invoke<boolean>('test_database_connection');
}

// Config commands
export async function getConfig(): Promise<AppConfig> {
  return await invoke<AppConfig>('get_config');
}

export async function updateConfig(config: AppConfig): Promise<void> {
  return await invoke('update_config', { config });
}

// TMDB commands
export async function tmdbSearchMovie(
  query: string,
  apiKey: string,
  language?: string
): Promise<TmdbSearchResponse> {
  return await invoke<TmdbSearchResponse>('tmdb_search_movie', {
    query,
    apiKey,
    language,
  });
}

export async function tmdbGetMovieDetails(
  movieId: number,
  apiKey: string,
  language?: string
): Promise<any> {
  return await invoke('tmdb_get_movie_details', {
    movieId,
    apiKey,
    language,
  });
}

// Helper to get image URL from TMDB path
export function getTmdbImageUrl(path: string, size: string = 'w500'): string {
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// SMB Interfaces
export interface SmbShare {
  id: string;
  host: string;
  share: string;
  username?: string;
  password?: string;
  domain?: string;
  ip_address: string;
}

// SMB commands
export async function detectSmbShares(): Promise<SmbShare[]> {
  return await invoke<SmbShare[]>('detect_smb_shares');
}

export async function testSmbConnection(
  host: string,
  share: string,
  username?: string,
  password?: string,
  domain?: string
): Promise<boolean> {
  return await invoke<boolean>('test_smb_connection', {
    host,
    share,
    username,
    password,
    domain,
  });
}

export async function mountSmbShare(
  host: string,
  share: string,
  mountPoint: string,
  username?: string,
  password?: string,
  domain?: string
): Promise<void> {
  return await invoke('mount_smb_share', {
    host,
    share,
    mountPoint,
    username,
    password,
    domain,
  });
}
