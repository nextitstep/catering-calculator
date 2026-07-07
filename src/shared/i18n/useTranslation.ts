import { useCallback, useMemo } from 'react';
import { useSettings } from '@/features/settings/SettingsContext';
import { translations, type TranslationKey } from '@/shared/i18n/translations';

export function useTranslation() {
  const { language } = useSettings();

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] ?? translations.en[key],
    [language]
  );

  const dir = useMemo(() => (language === 'ar' ? 'rtl' : 'ltr'), [language]);

  return { t, dir, language };
}
