import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { AppSettings, Language, ThemeMode } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';

const STORAGE_KEY = 'catering-calc/settings';

interface SettingsContextValue extends AppSettings {
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeMode) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorageState<AppSettings>(
    STORAGE_KEY,
    DEFAULT_SETTINGS
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      setLanguage: (language) => setSettings((s) => ({ ...s, language })),
      setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
    }),
    [settings, setSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
