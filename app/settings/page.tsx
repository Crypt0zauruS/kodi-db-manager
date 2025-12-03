'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Languages, Database, Trash2, CheckCircle } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    const locale = localStorage.getItem('locale');
    localStorage.clear();
    if (locale) localStorage.setItem('locale', locale);
    sessionStorage.clear();
    setCacheCleared(true);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-muted-foreground hover:text-foreground">
              ← Back
            </button>
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Languages className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">{t('settings.language')}</h2>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setLocale('en')} className={'flex-1 py-2 px-4 rounded-lg border-2 transition-colors ' + (locale === 'en' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary')}>
                English
              </button>
              <button onClick={() => setLocale('fr')} className={'flex-1 py-2 px-4 rounded-lg border-2 transition-colors ' + (locale === 'fr' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary')}>
                Français
              </button>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">{t('settings.clearCache')}</h2>
            </div>
            <p className="text-muted-foreground mb-4">Clear all cached data. This will reload the app.</p>
            {cacheCleared ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>{t('settings.cacheCleared')}</span>
              </div>
            ) : (
              <button onClick={handleClearCache} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90">
                {t('settings.clearCache')}
              </button>
            )}
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">{t('settings.database')}</h2>
            </div>
            <p className="text-muted-foreground mb-4">Database connection is managed at startup. Restart the app to change connection settings.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
