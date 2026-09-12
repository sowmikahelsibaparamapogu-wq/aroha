import { useEffect, useState, useCallback } from 'react';

export function useNetworkStatus() {
  const [realOnline, setRealOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aroha_simulate_offline') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const handleOnline = () => setRealOnline(true);
    const handleOffline = () => setRealOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      localStorage.setItem('aroha_simulate_offline', String(next));
      return next;
    });
  }, []);

  const isOnline = realOnline && !isSimulatedOffline;

  return {
    isOnline,
    realOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
  };
}
