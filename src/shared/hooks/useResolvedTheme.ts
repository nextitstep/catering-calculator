import { useEffect, useState } from 'react';
import type { ThemeMode } from '@/types';

function getSystemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useResolvedTheme(mode: ThemeMode): 'light' | 'dark' {
  const [systemDark, setSystemDark] = useState(getSystemPrefersDark);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, []);

  if (mode === 'system') return systemDark ? 'dark' : 'light';
  return mode;
}
