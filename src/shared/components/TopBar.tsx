import { Button, Dropdown, Option, makeStyles, tokens } from '@fluentui/react-components';
import { WeatherMoon24Regular, WeatherSunny24Regular } from '@fluentui/react-icons';
import { useRecipesStore } from '@/features/recipes/RecipesContext';
import { useSettings } from '@/features/settings/SettingsContext';
import { useResolvedTheme } from '@/shared/hooks/useResolvedTheme';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  brand: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorBrandForeground1,
    whiteSpace: 'nowrap',
    '@media (min-width: 720px)': {
      display: 'none',
    },
  },
  dropdown: {
    minWidth: '160px',
    maxWidth: '280px',
    flex: 1,
  },
});

export function TopBar() {
  const styles = useStyles();
  const { recipes, activeRecipeId, activeRecipe, setActiveRecipeId } = useRecipesStore();
  const { theme, setTheme } = useSettings();
  const resolved = useResolvedTheme(theme);

  return (
    <header className={styles.root}>
      <span className={styles.brand}>Cost Calculator</span>
      <Dropdown
        className={styles.dropdown}
        value={activeRecipe?.name ?? ''}
        selectedOptions={activeRecipeId ? [activeRecipeId] : []}
        onOptionSelect={(_, data) => data.optionValue && setActiveRecipeId(data.optionValue)}
        aria-label="Active recipe"
      >
        {recipes.map((r) => (
          <Option key={r.id} value={r.id} text={r.name}>
            {r.name}
          </Option>
        ))}
      </Dropdown>
      <Button
        appearance="subtle"
        shape="circular"
        icon={resolved === 'dark' ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
        onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
      />
    </header>
  );
}
