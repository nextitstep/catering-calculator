import { NavLink } from 'react-router-dom';
import { makeStyles, tokens, mergeClasses } from '@fluentui/react-components';
import { navItems } from '@/app/navConfig';
import { useTranslation } from '@/shared/i18n/useTranslation';

const useStyles = makeStyles({
  root: {
    display: 'none',
    '@media (min-width: 720px)': {
      display: 'flex',
    },
    flexDirection: 'column',
    width: '232px',
    flexShrink: 0,
    padding: '20px 12px',
    gap: '4px',
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 12px 20px 12px',
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase500,
    color: tokens.colorBrandForeground1,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: tokens.borderRadiusMedium,
    textDecoration: 'none',
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightRegular,
    transition: 'background-color 0.15s ease',
    ':hover': {
      backgroundColor: tokens.colorSubtleBackgroundHover,
    },
  },
  itemActive: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
});

export function SideNav() {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <nav className={styles.root} aria-label="Primary">
      <div className={styles.brand}>Cost Calculator</div>
      {navItems.map((item) => (
        <NavLink
          key={item.key}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            mergeClasses(styles.item, isActive && styles.itemActive)
          }
        >
          {({ isActive }) => (
            <>
              {isActive ? item.activeIcon : item.icon}
              <span>{t(item.labelKey)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
