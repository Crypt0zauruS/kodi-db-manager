'use client';

import { useState, useEffect } from 'react';
import { Database, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { connectDatabase, type DatabaseConfig } from '../lib/tauri';
import { useI18n } from '../contexts/I18nContext';
import { Store } from '@tauri-apps/plugin-store';

interface DatabaseConnectionProps {
  onConnected: () => void;
}

export function DatabaseConnection({ onConnected }: DatabaseConnectionProps) {
  const { t } = useI18n();
  const [config, setConfig] = useState<DatabaseConfig>({
    host: '192.168.0.10',
    port: 3306,
    user: 'xbmc',
    password: 'xbmc',
    database: 'MyVideos121',
  });
  const [remember, setRemember] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load saved credentials
  useEffect(() => {
    async function loadCredentials() {
      try {
        const store = await Store.load('.settings.json');
        const saved = await store.get<DatabaseConfig>('dbCredentials');
        if (saved) {
          setConfig(saved);
        }
      } catch (err) {
        console.log('No saved credentials');
      }
    }
    loadCredentials();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    setSuccess(false);

    // Create timeout promise (5 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(t('db.timeout'))), 5000);
    });

    try {
      // Race between connection and timeout
      await Promise.race([
        connectDatabase(config),
        timeoutPromise,
      ]);

      // Save credentials if remember is checked
      if (remember) {
        const store = await Store.load('.settings.json');
        await store.set('dbCredentials', config);
        await store.save();
      }

      setSuccess(true);
      setTimeout(() => {
        onConnected();
      }, 500);
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">{t('db.title')}</h1>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('db.host')}</label>
              <input
                type="text"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={connecting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('db.port')}</label>
              <input
                type="number"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 3306 })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={connecting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('db.user')}</label>
              <input
                type="text"
                value={config.user}
                onChange={(e) => setConfig({ ...config, user: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={connecting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('db.password')}</label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={connecting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('db.database')}</label>
              <input
                type="text"
                value={config.database}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={connecting}
              />
            </div>

            {/* Remember checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4"
                disabled={connecting}
              />
              <label htmlFor="remember" className="text-sm">
                {t('db.rememberCredentials')}
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{t('db.connectionError')}</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <p>{t('db.connected')}</p>
              </div>
            )}

            {/* Connect button */}
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('db.connecting')}
                </>
              ) : (
                t('common.connect')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
