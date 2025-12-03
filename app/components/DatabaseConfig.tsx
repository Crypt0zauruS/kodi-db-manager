'use client';

import { useState } from 'react';
import { connectDatabase, type DatabaseConfig } from '../lib/tauri';
import { Database, Loader2 } from 'lucide-react';

interface DatabaseConfigProps {
  onConnected: () => void;
}

export function DatabaseConfigForm({ onConnected }: DatabaseConfigProps) {
  const [config, setConfig] = useState<DatabaseConfig>({
    host: 'localhost',
    port: 3306,
    user: 'kodi',
    password: '',
    database: 'MyVideos131',
  });
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    try {
      setConnecting(true);
      setError(null);
      await connectDatabase(config);
      onConnected();
    } catch (err: any) {
      setError(err.toString());
      console.error('Failed to connect:', err);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-6 border">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Database Configuration</h1>
          </div>

          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive text-destructive rounded-lg p-3">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Host</label>
              <input
                type="text"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="localhost"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Port</label>
              <input
                type="number"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="3306"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">User</label>
              <input
                type="text"
                value={config.user}
                onChange={(e) => setConfig({ ...config, user: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="kodi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Database</label>
              <input
                type="text"
                value={config.database}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="MyVideos131"
              />
            </div>

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect to Database'
              )}
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Enter your Kodi MySQL database credentials. The database name is usually MyVideos131 or similar.
          </p>
        </div>
      </div>
    </div>
  );
}
