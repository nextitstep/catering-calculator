import {
  Calculator24Filled,
  Calculator24Regular,
  Home24Filled,
  Home24Regular,
  Notebook24Filled,
  Notebook24Regular,
  Settings24Filled,
  Settings24Regular,
} from '@fluentui/react-icons';
import type { ReactElement } from 'react';
import type { TranslationKey } from '@/shared/i18n/translations';

export interface NavItem {
  key: string;
  path: string;
  labelKey: TranslationKey;
  icon: ReactElement;
  activeIcon: ReactElement;
  central?: boolean;
}

export const navItems: NavItem[] = [
  {
    key: 'dashboard',
    path: '/',
    labelKey: 'nav_dashboard',
    icon: <Home24Regular />,
    activeIcon: <Home24Filled />,
  },
  {
    key: 'menus',
    path: '/menus',
    labelKey: 'nav_menus',
    icon: <Notebook24Regular />,
    activeIcon: <Notebook24Filled />,
  },
  {
    key: 'simulator',
    path: '/simulator',
    labelKey: 'nav_simulator',
    icon: <Calculator24Regular />,
    activeIcon: <Calculator24Filled />,
    central: true,
  },
  {
    key: 'settings',
    path: '/settings',
    labelKey: 'nav_settings',
    icon: <Settings24Regular />,
    activeIcon: <Settings24Filled />,
  },
];
