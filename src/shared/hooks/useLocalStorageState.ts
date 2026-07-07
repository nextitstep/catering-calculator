import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '@/shared/lib/storage';

export function useLocalStorageState<T>(key: string, initialValue: T | (() => T)) {
  const [state, setState] = useState<T>(() => {
    const fallback = initialValue instanceof Function ? initialValue() : initialValue;
    return readStorage(key, fallback);
  });

  useEffect(() => {
    writeStorage(key, state);
  }, [key, state]);

  return [state, setState] as const;
}
