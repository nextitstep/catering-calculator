import {
  Badge,
  Card,
  Field,
  Radio,
  RadioGroup,
  Text,
  Title2,
  Title3,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { useSettings } from '@/features/settings/SettingsContext';
import { useMenusStore } from '@/features/menus/MenusContext';
import { IngredientCatalogManager } from '@/features/ingredientCatalog/components/IngredientCatalogManager';
import type { Language, ThemeMode } from '@/types';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    maxWidth: '640px',
    marginTop: '16px',
    marginBottom: '24px',
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  card: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  caption: {
    color: tokens.colorNeutralForeground3,
  },
  sectionTitle: {
    marginBottom: '12px',
    display: 'block',
  },
});

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
};

const THEME_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export function SettingsPage() {
  const styles = useStyles();
  const { language, theme, setLanguage, setTheme } = useSettings();
  const { sync } = useMenusStore();

  return (
    <div>
      <Title2>Settings</Title2>
      <div className={styles.grid}>
        <Card className={styles.card}>
          <Title3>Sync</Title3>
          {!sync.enabled ? (
            <Text className={styles.caption}>Cloud sync is not configured for this build.</Text>
          ) : sync.authFailed ? (
            <>
              <Badge appearance="tint" color="danger">
                Not connected
              </Badge>
              <Text size={200} className={styles.caption}>
                Couldn't reach the shared sync service - you're working locally on this device
                only. Nothing is lost; this device's changes will sync once it reconnects.
              </Text>
            </>
          ) : (
            <>
              <Badge appearance="tint" color={sync.ready ? 'success' : 'warning'}>
                {sync.ready ? 'Live' : 'Connecting...'}
              </Badge>
              <Text size={200} className={styles.caption}>
                Menus and ingredients sync automatically, in real time, with everyone else who has
                the app open. The app keeps working offline either way.
              </Text>
            </>
          )}
        </Card>

        <Card className={styles.card}>
          <Title3>Language</Title3>
          <Field>
            <RadioGroup
              value={language}
              onChange={(_, data) => setLanguage(data.value as Language)}
            >
              {(Object.keys(LANGUAGE_LABELS) as Language[]).map((l) => (
                <Radio key={l} value={l} label={LANGUAGE_LABELS[l]} />
              ))}
            </RadioGroup>
          </Field>
        </Card>

        <Card className={styles.card}>
          <Title3>Theme</Title3>
          <Field>
            <RadioGroup value={theme} onChange={(_, data) => setTheme(data.value as ThemeMode)}>
              {(Object.keys(THEME_LABELS) as ThemeMode[]).map((t) => (
                <Radio key={t} value={t} label={THEME_LABELS[t]} />
              ))}
            </RadioGroup>
          </Field>
        </Card>
      </div>

      <Title3 className={styles.sectionTitle}>Ingredients</Title3>
      <IngredientCatalogManager />
    </div>
  );
}
