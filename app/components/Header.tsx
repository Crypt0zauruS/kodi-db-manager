'use client';

import { Film, Globe } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export function Header() {
  const { t, locale, setLocale } = useI18n();

  return (
    <header className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Film className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Kodi Database Manager</h1>
              <p className="text-sm text-white/80">{t('header.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-white/80" />
            <div className="flex gap-1 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={() => setLocale('en')}
                className={`px-3 py-1.5 rounded font-medium transition-all ${
                  locale === 'en'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('fr')}
                className={`px-3 py-1.5 rounded font-medium transition-all ${
                  locale === 'fr'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                FR
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
