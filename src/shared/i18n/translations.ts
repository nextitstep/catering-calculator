import type { Language } from '@/types';

export const translations = {
  en: {
    nav_dashboard: 'Dashboard',
    nav_menus: 'Menus',
    nav_simulator: 'Cost Simulator',
    nav_settings: 'Settings',
    action_undo: 'Undo',
  },
  fr: {
    nav_dashboard: 'Tableau de bord',
    nav_menus: 'Menus',
    nav_simulator: 'Simulateur de coûts',
    nav_settings: 'Paramètres',
    action_undo: 'Annuler',
  },
  ar: {
    nav_dashboard: 'لوحة التحكم',
    nav_menus: 'القوائم',
    nav_simulator: 'محاكي التكلفة',
    nav_settings: 'الإعدادات',
    action_undo: 'تراجع',
  },
} satisfies Record<Language, Record<string, string>>;

export type TranslationKey = keyof typeof translations.en;
