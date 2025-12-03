'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '../contexts/I18nContext';
import { ArrowLeft, Network, Loader2, Plus, Save, Check, X, HardDrive } from 'lucide-react';
import { Store } from '@tauri-apps/plugin-store';
import type { SmbShare } from '../lib/tauri';

export default function ManagementPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [detecting, setDetecting] = useState(false);
  const [detectedShares, setDetectedShares] = useState<SmbShare[]>([]);
  const [savedShares, setSavedShares] = useState<SmbShare[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const [newShare, setNewShare] = useState<Partial<SmbShare>>({
    id: '',
    host: '',
    share: '',
    username: '',
    password: '',
    domain: '',
    ip_address: '',
  });

  // Load saved shares on mount
  useEffect(() => {
    loadSavedShares();
  }, []);

  async function loadSavedShares() {
    try {
      const store = await Store.load('.settings.json');
      const shares = await store.get<SmbShare[]>('smbShares');
      if (shares) {
        setSavedShares(shares);
      }
    } catch (err) {
      console.log('No saved shares');
    }
  }

  async function detectShares() {
    setDetecting(true);
    try {
      const { detectSmbShares } = await import('../lib/tauri');
      const shares = await detectSmbShares();
      setDetectedShares(shares);
    } catch (err) {
      console.error('Detection failed:', err);
    } finally {
      setDetecting(false);
    }
  }

  async function handleAddShare() {
    const share: SmbShare = {
      id: crypto.randomUUID(),
      host: newShare.host || '',
      share: newShare.share || '',
      username: newShare.username,
      password: newShare.password,
      domain: newShare.domain,
      ip_address: newShare.ip_address || newShare.host || '',
    };

    const updatedShares = [...savedShares, share];
    setSavedShares(updatedShares);

    // Save to store
    try {
      const store = await Store.load('.settings.json');
      await store.set('smbShares', updatedShares);
      await store.save();
    } catch (err) {
      console.error('Failed to save share:', err);
    }

    // Reset form
    setNewShare({
      id: '',
      host: '',
      share: '',
      username: '',
      password: '',
      domain: '',
      ip_address: '',
    });
    setShowAddForm(false);
  }

  async function handleSaveDetectedShare(share: SmbShare) {
    const updatedShares = [...savedShares, share];
    setSavedShares(updatedShares);

    try {
      const store = await Store.load('.settings.json');
      await store.set('smbShares', updatedShares);
      await store.save();
    } catch (err) {
      console.error('Failed to save share:', err);
    }

    // Remove from detected
    setDetectedShares(detectedShares.filter(s => s.id !== share.id));
  }

  async function handleRemoveShare(id: string) {
    const updatedShares = savedShares.filter(s => s.id !== id);
    setSavedShares(updatedShares);

    try {
      const store = await Store.load('.settings.json');
      await store.set('smbShares', updatedShares);
      await store.save();
    } catch (err) {
      console.error('Failed to remove share:', err);
    }
  }

  async function handleTestConnection(id: string) {
    setTestingId(id);
    try {
      const share = savedShares.find(s => s.id === id);
      if (!share) return;

      const { testSmbConnection } = await import('../lib/tauri');
      const result = await testSmbConnection(
        share.host,
        share.share,
        share.username,
        share.password,
        share.domain
      );

      if (result) {
        alert(t('management.smb.connected'));
      } else {
        alert(t('management.smb.failed'));
      }
    } catch (err) {
      console.error('Test failed:', err);
      alert(t('management.smb.failed'));
    } finally {
      setTestingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{t('management.title')}</h1>
          </div>
        </div>

        {/* SMB Shares Section */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Network className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">{t('management.smb.title')}</h2>
            </div>
            <button
              onClick={detectShares}
              disabled={detecting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {detecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('management.smb.detecting')}
                </>
              ) : (
                <>
                  <Network className="w-5 h-5" />
                  {t('management.smb.detecting')}
                </>
              )}
            </button>
          </div>

          {/* Detected Shares */}
          {detectedShares.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{t('management.smb.detected')}</h3>
              <div className="space-y-3">
                {detectedShares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{share.host}/{share.share}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveDetectedShare(share)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                      {t('common.add')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Shares */}
          {savedShares.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{t('management.smb.saved')}</h3>
              <div className="space-y-3">
                {savedShares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">{share.host}/{share.share}</p>
                        <p className="text-sm text-muted-foreground">
                          {share.username ? `${share.username}${share.domain ? `@${share.domain}` : ''}` : t('management.smb.noCredentials')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTestConnection(share.id)}
                        disabled={testingId === share.id}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {testingId === share.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t('management.smb.testConnection')
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveShare(share.id)}
                        className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Manual Share Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg hover:bg-accent transition-colors w-full"
            >
              <Plus className="w-5 h-5" />
              {t('management.smb.manual')}
            </button>
          )}

          {/* Add Manual Share Form */}
          {showAddForm && (
            <div className="border-2 border-primary/30 rounded-lg p-6 bg-accent/20">
              <h3 className="text-lg font-semibold mb-4">{t('management.smb.manual')}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('management.smb.host')}</label>
                    <input
                      type="text"
                      value={newShare.host}
                      onChange={(e) => setNewShare({ ...newShare, host: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="192.168.1.10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('management.smb.share')}</label>
                    <input
                      type="text"
                      value={newShare.share}
                      onChange={(e) => setNewShare({ ...newShare, share: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Movies"
                    />
                  </div>
                </div>

                {/* Guest Mode Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="guestMode"
                    checked={isGuest}
                    onChange={(e) => {
                      setIsGuest(e.target.checked);
                      if (e.target.checked) {
                        setNewShare({ ...newShare, username: 'guest', password: '' });
                      } else {
                        setNewShare({ ...newShare, username: '', password: '' });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <label htmlFor="guestMode" className="text-sm font-medium">
                    {t('management.smb.guestMode')}
                  </label>
                </div>

                {!isGuest && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{t('management.smb.username')}</label>
                        <input
                          type="text"
                          value={newShare.username}
                          onChange={(e) => setNewShare({ ...newShare, username: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{t('management.smb.password')}</label>
                        <input
                          type="password"
                          value={newShare.password}
                          onChange={(e) => setNewShare({ ...newShare, password: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('management.smb.domain')}</label>
                      <input
                        type="text"
                        value={newShare.domain}
                        onChange={(e) => setNewShare({ ...newShare, domain: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-accent"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleAddShare}
                    disabled={!newShare.host || !newShare.share}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {t('management.smb.addShare')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
