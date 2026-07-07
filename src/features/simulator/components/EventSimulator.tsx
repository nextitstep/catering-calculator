import { useMemo } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Input,
  Text,
  Title3,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Delete24Regular } from '@fluentui/react-icons';
import { useRecipesStore } from '@/features/recipes/RecipesContext';
import { useEventSelection } from '@/features/simulator/useEventSelection';
import {
  computeRecipeMetricsForPortions,
  marginPercent,
  markupPercent,
  profit,
} from '@/features/costing/calculations';
import { formatMoney, formatPercent } from '@/shared/lib/currency';
import { StatCard } from '@/shared/components/StatCard';
import {
  ArrowTrendingLines24Regular,
  DataTrending24Regular,
  DocumentPercent24Regular,
  Money24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '24px',
    '@media (min-width: 560px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    marginBottom: '8px',
  },
  rowDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '8px',
    '@media (min-width: 560px)': {
      gridTemplateColumns: '2fr 1fr 1fr 1fr',
      alignItems: 'center',
    },
  },
  recipeName: {
    fontWeight: tokens.fontWeightSemibold,
  },
  metric: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  empty: {
    padding: '32px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
});

export function EventSimulator() {
  const styles = useStyles();
  const { recipes } = useRecipesStore();
  const { entries, isIncluded, toggleRecipe, setPortions, clear } = useEventSelection();

  const rows = useMemo(
    () =>
      entries
        .map((entry) => {
          const recipe = recipes.find((r) => r.id === entry.recipeId);
          if (!recipe) return null;
          const metrics = computeRecipeMetricsForPortions(recipe, entry.portions);
          return { recipe, entry, metrics };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null),
    [entries, recipes]
  );

  const totals = useMemo(() => {
    const totalCost = rows.reduce((sum, r) => sum + r.metrics.grandTotal, 0);
    const totalRevenue = rows.reduce((sum, r) => sum + r.metrics.revenue, 0);
    const totalProfit = profit(totalRevenue, totalCost);
    return {
      totalCost,
      totalRevenue,
      totalProfit,
      margin: marginPercent(totalProfit, totalRevenue),
      markup: markupPercent(totalProfit, totalCost),
    };
  }, [rows]);

  return (
    <div>
      <div className={styles.kpiGrid}>
        <StatCard icon={<Money24Regular />} value={totals.totalCost} label="Total Cost" format={formatMoney} />
        <StatCard
          icon={<ArrowTrendingLines24Regular />}
          value={totals.totalRevenue}
          label="Total Revenue"
          format={formatMoney}
          delay={0.03}
        />
        <StatCard
          icon={<DataTrending24Regular />}
          value={totals.totalProfit}
          label="Total Profit"
          format={formatMoney}
          trend={totals.totalProfit >= 0 ? 'positive' : 'negative'}
          delay={0.06}
        />
        <StatCard
          icon={<DocumentPercent24Regular />}
          value={totals.margin}
          label="Margin %"
          format={formatPercent}
          trend={totals.totalProfit >= 0 ? 'positive' : 'negative'}
          delay={0.09}
        />
      </div>

      <div className={styles.listHeader}>
        <Title3>Recipes in this event</Title3>
        {entries.length > 0 ? (
          <Button appearance="subtle" icon={<Delete24Regular />} onClick={clear}>
            Clear all
          </Button>
        ) : null}
      </div>

      {recipes.length === 0 ? (
        <Card className={styles.empty}>No recipes yet.</Card>
      ) : (
        recipes.map((recipe) => {
          const included = isIncluded(recipe.id);
          const row = rows.find((r) => r.recipe.id === recipe.id);
          return (
            <Card key={recipe.id} className={styles.row}>
              <Checkbox
                checked={included}
                onChange={() => toggleRecipe(recipe.id, recipe.simulationPortions)}
              />
              <div className={styles.rowDetails}>
                <Text className={styles.recipeName}>{recipe.name}</Text>
                {included && row ? (
                  <>
                    <Input
                      type="number"
                      value={String(row.entry.portions)}
                      onChange={(_, data) =>
                        setPortions(recipe.id, Number(data.value) || 0)
                      }
                    />
                    <Text className={styles.metric}>
                      Cost: {formatMoney(row.metrics.grandTotal)}
                    </Text>
                    <Text className={styles.metric}>
                      Revenue: {formatMoney(row.metrics.revenue)}
                    </Text>
                  </>
                ) : (
                  <Text className={styles.metric}>Not included</Text>
                )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
