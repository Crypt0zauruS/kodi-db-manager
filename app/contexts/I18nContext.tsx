'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'fr';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.connect': 'Connect',
    'common.retry': 'Retry',

    // Header
    'header.subtitle': 'Manage your Kodi media library with ease',
    
    // Movies
    'movies.title': 'Movies',
    'movies.searchPlaceholder': 'Search movies...',
    'movies.noMovies': 'No movies found',
    'movies.count': 'movies',
    'movies.countSingular': 'movie',
    
    // Database
    'db.notConnected': 'Database not connected',
    'db.connecting': 'Connecting...',
    'db.connected': 'Connected successfully',
    'db.connectionError': 'Connection failed',
    'db.timeout': 'Connection timeout (5s)',
    'db.title': 'Database Connection',
    'db.host': 'Host',
    'db.port': 'Port',
    'db.user': 'User',
    'db.password': 'Password',
    'db.database': 'Database',
    'db.rememberCredentials': 'Remember credentials',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.clearCache': 'Clear Cache',
    'settings.cacheCleared': 'Cache cleared successfully',
    'settings.database': 'Database Configuration',
    'settings.tmdb': 'TMDB API Key',
  },
  fr: {
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.close': 'Fermer',
    'common.connect': 'Connecter',
    'common.retry': 'Réessayer',

    // Header
    'header.subtitle': 'Gérez votre bibliothèque Kodi en toute simplicité',
    
    // Movies
    'movies.title': 'Films',
    'movies.searchPlaceholder': 'Rechercher des films...',
    'movies.noMovies': 'Aucun film trouvé',
    'movies.count': 'films',
    'movies.countSingular': 'film',
    
    // Database
    'db.notConnected': 'Base de données non connectée',
    'db.connecting': 'Connexion en cours...',
    'db.connected': 'Connecté avec succès',
    'db.connectionError': 'Échec de la connexion',
    'db.timeout': 'Délai de connexion dépassé (5s)',
    'db.title': 'Connexion Base de Données',
    'db.host': 'Hôte',
    'db.port': 'Port',
    'db.user': 'Utilisateur',
    'db.password': 'Mot de passe',
    'db.database': 'Base de données',
    'db.rememberCredentials': 'Mémoriser les identifiants',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.language': 'Langue',
    'settings.clearCache': 'Vider le cache',
    'settings.cacheCleared': 'Cache vidé avec succès',
    'settings.database': 'Configuration Base de Données',
    'settings.tmdb': 'Clé API TMDB',
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  // Load saved locale from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved === 'en' || saved === 'fr') {
      setLocale(saved);
    }
  }, []);

  // Save locale to localStorage
  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
