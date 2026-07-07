import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { makeStyles, tokens } from '@fluentui/react-components';
import { SideNav } from '@/shared/components/SideNav';
import { BottomNav } from '@/shared/components/BottomNav';
import { TopBar } from '@/shared/components/TopBar';
import { useMenusStore } from '@/features/menus/MenusContext';
import { useAppToaster } from '@/shared/components/ToasterProvider';
import { useTranslation } from '@/shared/i18n/useTranslation';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    '@media (min-width: 720px)': {
      flexDirection: 'row',
    },
  },
  main: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: '16px',
    paddingBottom: '76px',
    backgroundColor: tokens.colorNeutralBackground3,
    '@media (min-width: 720px)': {
      padding: '24px 32px',
      paddingBottom: '32px',
    },
  },
});

export function AppShell() {
  const styles = useStyles();
  const { pendingDeletion, undoDelete, dismissUndo } = useMenusStore();
  const { notify } = useAppToaster();
  const { t } = useTranslation();

  useEffect(() => {
    if (!pendingDeletion) return;
    notify({
      title: `"${pendingDeletion.menu.name}" deleted`,
      actionText: t('action_undo'),
      onAction: () => {
        undoDelete();
      },
    });
    const timeout = setTimeout(() => dismissUndo(), 6000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDeletion]);

  return (
    <div className={styles.root}>
      <SideNav />
      <div className={styles.main}>
        <TopBar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
