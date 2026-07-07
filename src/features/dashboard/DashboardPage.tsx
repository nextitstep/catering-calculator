import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Title2, makeStyles } from '@fluentui/react-components';
import { Add24Filled, Calculator24Regular, Food24Regular, Notebook24Regular } from '@fluentui/react-icons';
import { useMenusStore } from '@/features/menus/MenusContext';
import { StatCard } from '@/shared/components/StatCard';

const useStyles = makeStyles({
  header: {
    marginBottom: '16px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '24px',
    maxWidth: '480px',
  },
  actionsCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '320px',
  },
  actionButton: {
    justifyContent: 'flex-start',
  },
});

export function DashboardPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { menus, createMenu } = useMenusStore();

  const ingredientCount = useMemo(() => {
    const names = new Set<string>();
    for (const menu of menus) {
      for (const ing of menu.ingredients) {
        const key = ing.name.trim().toLowerCase();
        if (key) names.add(key);
      }
    }
    return names.size;
  }, [menus]);

  return (
    <div>
      <div className={styles.header}>
        <Title2>Overview</Title2>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          icon={<Notebook24Regular />}
          value={menus.length}
          label="Menus"
          format={(v) => String(Math.round(v))}
        />
        <StatCard
          icon={<Food24Regular />}
          value={ingredientCount}
          label="Ingredients"
          format={(v) => String(Math.round(v))}
        />
      </div>

      <Card className={styles.actionsCard}>
        <Button
          className={styles.actionButton}
          appearance="primary"
          icon={<Add24Filled />}
          onClick={() => {
            const id = createMenu();
            navigate(`/menus/${id}`);
          }}
        >
          New Menu
        </Button>
        <Button
          className={styles.actionButton}
          icon={<Notebook24Regular />}
          onClick={() => navigate('/menus')}
        >
          View Menus
        </Button>
        <Button
          className={styles.actionButton}
          icon={<Calculator24Regular />}
          onClick={() => navigate('/simulator')}
        >
          Open Cost Simulator
        </Button>
      </Card>
    </div>
  );
}
