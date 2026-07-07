import { useMemo } from 'react';
import { makeStyles, mergeClasses, Card, Title2, Title3, Button } from '@fluentui/react-components';
import {
  ChartMultiple24Regular,
  DataTrending24Regular,
  DocumentPercent24Regular,
  Money24Regular,
  MoneyHand24Regular,
  ReceiptMoney24Regular,
  ArrowTrendingLines24Regular,
  Wallet24Regular,
} from '@fluentui/react-icons';
import { useRecipesStore } from '@/features/recipes/RecipesContext';
import { computeRecipeMetrics, profitSimulationSeries } from '@/features/costing/calculations';
import { formatMoney, formatPercent } from '@/shared/lib/currency';
import { StatCard } from '@/shared/components/StatCard';
import { CostBarChart } from '@/features/dashboard/components/CostBarChart';
import { CostPieChart } from '@/features/dashboard/components/CostPieChart';
import { ProfitLineChart } from '@/features/dashboard/components/ProfitLineChart';
import { TargetPriceCard } from '@/features/simulator/components/TargetPriceCard';

const useStyles = makeStyles({
  header: {
    marginBottom: '16px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '24px',
    '@media (min-width: 560px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    '@media (min-width: 960px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    '@media (min-width: 960px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  chartCard: {
    padding: '20px',
  },
  fullSpan: {
    gridColumn: '1 / -1',
  },
  empty: {
    padding: '48px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
});

export function DashboardPage() {
  const styles = useStyles();
  const { activeRecipe, createRecipe } = useRecipesStore();

  const metrics = useMemo(
    () => (activeRecipe ? computeRecipeMetrics(activeRecipe) : null),
    [activeRecipe]
  );

  const profitSeries = useMemo(
    () => (activeRecipe ? profitSimulationSeries(activeRecipe) : []),
    [activeRecipe]
  );

  if (!activeRecipe || !metrics) {
    return (
      <Card className={styles.empty}>
        <Title2>No recipe selected</Title2>
        <Button appearance="primary" onClick={() => createRecipe()}>
          Create your first recipe
        </Button>
      </Card>
    );
  }

  const profitTrend = metrics.profit >= 0 ? 'positive' : 'negative';
  const marginTrend = metrics.margin >= 0 ? 'positive' : 'negative';

  return (
    <div>
      <div className={styles.header}>
        <Title2>{activeRecipe.name}</Title2>
      </div>

      <div className={styles.header}>
        <TargetPriceCard
          costPerPortion={metrics.costPerPortion}
          sellingPrice={activeRecipe.sellingPrice}
        />
      </div>

      <div className={styles.kpiGrid}>
        <StatCard
          icon={<Money24Regular />}
          value={metrics.grandTotal}
          label="Total Cost"
          format={(v) => formatMoney(v)}
          delay={0}
        />
        <StatCard
          icon={<Wallet24Regular />}
          value={metrics.costPerPortion}
          label="Cost Per Portion"
          format={(v) => formatMoney(v)}
          delay={0.03}
        />
        <StatCard
          icon={<ReceiptMoney24Regular />}
          value={activeRecipe.sellingPrice}
          label="Selling Price"
          format={(v) => formatMoney(v)}
          delay={0.06}
        />
        <StatCard
          icon={<MoneyHand24Regular />}
          value={metrics.profitPerPortion}
          label="Profit Per Portion"
          format={(v) => formatMoney(v)}
          trend={profitTrend}
          delay={0.09}
        />
        <StatCard
          icon={<ArrowTrendingLines24Regular />}
          value={metrics.revenue}
          label="Total Revenue"
          format={(v) => formatMoney(v)}
          delay={0.12}
        />
        <StatCard
          icon={<DataTrending24Regular />}
          value={metrics.profit}
          label="Total Profit"
          format={(v) => formatMoney(v)}
          trend={profitTrend}
          delay={0.15}
        />
        <StatCard
          icon={<DocumentPercent24Regular />}
          value={metrics.margin}
          label="Margin %"
          format={formatPercent}
          trend={marginTrend}
          delay={0.18}
        />
        <StatCard
          icon={<ChartMultiple24Regular />}
          value={metrics.markup}
          label="Markup %"
          format={formatPercent}
          trend={marginTrend}
          delay={0.21}
        />
      </div>

      <div className={styles.chartsGrid}>
        <Card className={styles.chartCard}>
          <Title3>Cost Breakdown</Title3>
          <CostBarChart breakdown={metrics.breakdown} />
        </Card>
        <Card className={styles.chartCard}>
          <Title3>Expense Distribution</Title3>
          <CostPieChart breakdown={metrics.breakdown} />
        </Card>
        <Card className={mergeClasses(styles.chartCard, styles.fullSpan)}>
          <Title3>Profit vs Price</Title3>
          <ProfitLineChart data={profitSeries} currentPrice={activeRecipe.sellingPrice} />
        </Card>
      </div>
    </div>
  );
}
