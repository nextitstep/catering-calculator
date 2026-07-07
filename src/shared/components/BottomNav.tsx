import { NavLink } from 'react-router-dom';
import { makeStyles, tokens, mergeClasses } from '@fluentui/react-components';
import { navItems } from '@/app/navConfig';
import { useTranslation } from '@/shared/i18n/useTranslation';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'flex-end',
    '@media (min-width: 720px)': {
      display: 'none',
    },
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: tokens.colorNeutralBackground1,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingBottom: 'env(safe-area-inset-bottom)',
    boxShadow: tokens.shadow16,
  },
  item: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    padding: '8px 4px 6px 4px',
    minHeight: '56px',
    textDecoration: 'none',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase100,
  },
  itemActive: {
    color: tokens.colorBrandForeground1,
  },
  centralItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    textDecoration: 'none',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase100,
    gap: '2px',
    paddingTop: '2px',
  },
  centralButton: {
    width: '52px',
    height: '52px',
    borderRadius: tokens.borderRadiusCircular,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    boxShadow: tokens.shadow8,
    transform: 'translateY(-14px)',
    fontSize: '24px',
  },
  centralButtonActive: {
    backgroundColor: tokens.colorBrandBackgroundPressed,
  },
  centralLabel: {
    marginTop: '-10px',
  },
});

export function BottomNav() {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <nav className={styles.root} aria-label="Primary">
      {navItems.map((item) => {
        if (item.central) {
          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={styles.centralItem}
              aria-label={t(item.labelKey)}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={mergeClasses(
                      styles.centralButton,
                      isActive && styles.centralButtonActive
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className={styles.centralLabel}>{t(item.labelKey)}</span>
                </>
              )}
            </NavLink>
          );
        }
        return (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => mergeClasses(styles.item, isActive && styles.itemActive)}
          >
            {({ isActive }) => (
              <>
                {isActive ? item.activeIcon : item.icon}
                <span>{t(item.labelKey)}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
