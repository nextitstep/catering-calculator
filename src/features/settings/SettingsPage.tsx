import {
  Avatar,
  Button,
  Card,
  Field,
  Radio,
  RadioGroup,
  Spinner,
  Text,
  Title2,
  Title3,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { CloudSync24Regular } from '@fluentui/react-icons';
import { useSettings } from '@/features/settings/SettingsContext';
import { useRecipesStore } from '@/features/recipes/RecipesContext';
import type { Language, ThemeMode } from '@/types';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    maxWidth: '640px',
    marginTop: '16px',
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
  accountRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  caption: {
    color: tokens.colorNeutralForeground3,
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
  const { cloudSync } = useRecipesStore();

  return (
    <div>
      <Title2>Settings</Title2>
      <div className={styles.grid}>
        <Card className={styles.card}>
          <Title3>Account & Sync</Title3>
          {!cloudSync.enabled ? (
            <Text className={styles.caption}>Cloud sync is not configured for this build.</Text>
          ) : !cloudSync.authReady ? (
            <Spinner size="tiny" label="Checking sign-in status..." />
          ) : cloudSync.user ? (
            <>
              <div className={styles.accountRow}>
                <Avatar
                  name={cloudSync.user.displayName ?? cloudSync.user.email ?? 'Signed in'}
                  image={{ src: cloudSync.user.photoURL ?? undefined }}
                />
                <div>
                  <Text weight="semibold" block>
                    {cloudSync.user.displayName ?? cloudSync.user.email}
                  </Text>
                  <Text size={200} className={styles.caption}>
                    Recipes sync automatically across your devices
                  </Text>
                </div>
              </div>
              <Button onClick={() => cloudSync.signOut()}>Sign out</Button>
            </>
          ) : (
            <>
              <Text className={styles.caption}>
                Sign in to sync your recipes across devices. The app keeps working offline either
                way.
              </Text>
              <Button
                appearance="primary"
                icon={<CloudSync24Regular />}
                onClick={() => cloudSync.signIn()}
              >
                Sign in with Google
              </Button>
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
    </div>
  );
}
