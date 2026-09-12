import React from 'react';
import { WifiOff, RefreshCw, CheckCircle, Database } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface OfflineBannerProps {
  isOnline: boolean;
  isSyncing: boolean;
  syncProgress: number; // 0 to 100
  queuedDocsCount: number;
  onSyncNow: () => void;
  onToggleBackOnline: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  isSyncing,
  syncProgress,
  queuedDocsCount,
  onSyncNow,
  onToggleBackOnline,
}) => {
  const { t } = useLanguage();

  if (isOnline && !isSyncing) {
    return null;
  }

  // Active sync in progress
  if (isSyncing) {
    return (
      <div
        id="sync-progress-banner"
        className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-950 font-medium">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-700 animate-spin flex-shrink-0" />
            <span>{t('syncing')} ({syncProgress}%)</span>
          </div>

          <div className="w-full sm:w-48 bg-emerald-200/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-700 h-full transition-all duration-300 rounded-full"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Soft coral offline banner (Non-alarming)
  return (
    <div
      id="offline-status-banner"
      className="bg-orange-50 border-b border-orange-200 px-4 py-2.5 text-orange-900 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-orange-950">📴 {t('offline')}</span>
            <p className="text-[11px] text-orange-800 font-normal">
              {t('offlineBannerDesc', 'You can fill forms and upload documents offline. Data is saved locally in IndexedDB.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {queuedDocsCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[11px] font-medium border border-orange-200">
              <Database className="w-3 h-3 text-orange-600" />
              {queuedDocsCount} {t('queued')}
            </span>
          )}

          <button
            type="button"
            onClick={onToggleBackOnline}
            className="px-2.5 py-1 rounded-md bg-white border border-orange-300 text-orange-800 font-medium hover:bg-orange-100/50 transition-colors shadow-2xs text-[11px] cursor-pointer"
          >
            {t('online')}
          </button>
        </div>
      </div>
    </div>
  );
};
