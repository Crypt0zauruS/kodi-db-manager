'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMovies, testDatabaseConnection, type Movie } from './lib/tauri';
import { MovieCard } from './components/MovieCard';
import { DatabaseConnection } from './components/DatabaseConnection';
import { Search, Film, Loader2, Settings } from 'lucide-react';
import { useI18n } from './contexts/I18nContext';

export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkingConnection, setCheckingConnection] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      setCheckingConnection(true);
      await testDatabaseConnection();
      setIsConnected(true);
      loadMovies();
    } catch (err) {
      setIsConnected(false);
      setLoading(false);
    } finally {
      setCheckingConnection(false);
    }
  }

  async function loadMovies() {
    try {
      setLoading(true);
      setError(null);
      const data = await getMovies();
      setMovies(data);
    } catch (err: any) {
      setError(err.toString());
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleConnected() {
    setIsConnected(true);
    loadMovies();
  }

  if (checkingConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-lg">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return <DatabaseConnection onConnected={handleConnected} />;
  }

  const filteredMovies = movies.filter((movie) =>
    movie.c00.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Kodi Database Manager</h1>
            </div>
            <button
              onClick={() => router.push('/settings')}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title={t('settings.title')}
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('movies.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">{t('common.loading')}</span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4">
            <p className="font-semibold">{t('common.error')}</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && filteredMovies.length === 0 && (
          <div className="text-center py-20">
            <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">{t('movies.noMovies')}</p>
          </div>
        )}

        {!loading && !error && filteredMovies.length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                {filteredMovies.length} {filteredMovies.length === 1 ? t('movies.countSingular') : t('movies.count')}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.idMovie}
                  movie={movie}
                  onClick={() => {
                    console.log('Movie clicked:', movie);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
