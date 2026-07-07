import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { FluentProvider } from '@fluentui/react-components';
import { MenusProvider } from '@/features/menus/MenusContext';
import { IngredientCatalogProvider } from '@/features/ingredientCatalog/IngredientCatalogContext';
import { SettingsProvider, useSettings } from '@/features/settings/SettingsContext';
import { AppToasterProvider } from '@/shared/components/ToasterProvider';
import { AppShell } from '@/shared/components/AppShell';
import { useResolvedTheme } from '@/shared/hooks/useResolvedTheme';
import { lightTheme, darkTheme } from '@/app/theme';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { MenusPage } from '@/features/menus/MenusPage';
import { MenuDetailPage } from '@/features/menus/MenuDetailPage';
import { SimulatorPage } from '@/features/simulator/SimulatorPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { AnalyticsPageTracker } from '@/shared/components/AnalyticsPageTracker';

function ThemedShell() {
  const { theme, language } = useSettings();
  const resolved = useResolvedTheme(theme);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <FluentProvider
      theme={resolved === 'dark' ? darkTheme : lightTheme}
      style={{ minHeight: '100vh' }}
    >
      <AppToasterProvider>
        <HashRouter>
          <AnalyticsPageTracker />
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/menus" element={<MenusPage />} />
              <Route path="/menus/:menuId" element={<MenuDetailPage />} />
              <Route path="/simulator" element={<SimulatorPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </AppToasterProvider>
    </FluentProvider>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <IngredientCatalogProvider>
        <MenusProvider>
          <ThemedShell />
        </MenusProvider>
      </IngredientCatalogProvider>
    </SettingsProvider>
  );
}
