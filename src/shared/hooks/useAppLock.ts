import { useCallback, useState } from 'react';
import { APP_LOCK_STORAGE_KEY, APP_PIN } from '@/shared/lib/appLock';

export function useAppLock() {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(APP_LOCK_STORAGE_KEY) === 'true'
  );

  const tryUnlock = useCallback((pin: string) => {
    if (pin === APP_PIN) {
      localStorage.setItem(APP_LOCK_STORAGE_KEY, 'true');
      setUnlocked(true);
      return true;
    }
    return false;
  }, []);

  return { unlocked, tryUnlock };
}
