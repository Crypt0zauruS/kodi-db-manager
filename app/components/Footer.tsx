'use client';

import { useI18n } from '../contexts/I18nContext';
import { Heart } from 'lucide-react';

export function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{t('footer.madeBy')}</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
          </div>

          <p className="text-xs italic">{t('footer.subtitle')}</p>

          <div className="flex items-center gap-2 text-xs">
            <span>© {currentYear}</span>
            <span>•</span>
            <span>{t('footer.rights')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
