import { useMemo } from 'react';
import { Card, Field, Input, Slider, Title2, Title3, makeStyles } from '@fluentui/react-components';
import {
  ArrowTrendingLines24Regular,
  Box24Regular,
  ChartMultiple24Regular,
  DataTrending24Regular,
  DocumentPercent24Regular,
  MoneyHand24Regular,
  Sparkle24Regular,
  Toolbox24Regular,
  VehicleTruckProfile24Regular,
  Wrench24Regular,
} from '@fluentui/react-icons';
import { useRecipesStore } from '@/features/recipes/RecipesContext';
import {
  computeRecipeMetrics,
  pricingSuggestions,
  profitSimulationSeries,
  scaleFactor,
} from '@/features/costing/calculations';
import { formatMoney, formatPercent } from '@/shared/lib/currency';
import { StatCard } from '@/shared/components/StatCard';
import { PricingSuggestionsGrid } from '@/features/simulator/components/PricingSuggestionsGrid';
import { ProfitLineChart } from '@/features/dashboard/components/ProfitLineChart';
import { CostPieChart } from '@/features/dashboard/components/CostPieChart';
import { CostSummaryCard } from '@/features/simulator/components/CostSummaryCard';
import { TargetPriceCard } from '@/features/simulator/components/TargetPriceCard';
import { IngredientPricesList } from '@/features/simulator/components/IngredientPricesList';
import { OtherCostCard } from '@/features/ingredients/components/OtherCostCard';

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateAreas: '"summary" "content"',
    gap: '20px',
    '@media (min-width: 960px)': {
      gridTemplateColumns: 'minmax(0, 1fr) 320px',
      gridTemplateAreas: '"content summary"',
      alignItems: 'start',
    },
  },
  summaryArea: {
    gridArea: 'summary',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  contentArea: {
    gridArea: 'content',
    minWidth: 0,
  },
  priceCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '20px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  priceInput: {
    maxWidth: '180px',
  },
  slider: {
    flex: 1,
    minWidth: '200px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '24px',
    '@media (min-width: 560px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    '@media (min-width: 1200px)': {
      gridTemplateColumns: 'repeat(5, 1fr)',
    },
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    marginBottom: '12px',
    display: 'block',
  },
  otherCostsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    '@media (min-width: 560px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
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
  empty: {
    padding: '48px',
    textAlign: 'center',
  },
});

export function SimulatorPage() {
  const styles = useStyles();
  const {
    activeRecipe,
    updateSellingPrice,
    updateSimulationPortions,
    updateIngredient,
    updateCostItem,
  } = useRecipesStore();

  const metrics = useMemo(
    () => (activeRecipe ? computeRecipeMetrics(activeRecipe) : null),
    [activeRecipe]
  );
  const suggestions = useMemo(
    () => (activeRecipe ? pricingSuggestions(activeRecipe) : []),
    [activeRecipe]
  );
  const profitSeries = useMemo(
    () => (activeRecipe ? profitSimulationSeries(activeRecipe) : []),
    [activeRecipe]
  );
  const scale = useMemo(() => (activeRecipe ? scaleFactor(activeRecipe) : 1), [activeRecipe]);

  if (!activeRecipe || !metrics) {
    return (
      <Card className={styles.empty}>
        <Title2>No recipe selected</Title2>
      </Card>
    );
  }

  const maxSlider = Math.max(metrics.costPerPortion * 3, 100);
  const profitTrend = metrics.profit >= 0 ? 'positive' : 'negative';

  return (
    <div className={styles.root}>
      <div className={styles.summaryArea}>
        <CostSummaryCard
          simulationPortions={activeRecipe.simulationPortions}
          onSimulationPortionsChange={(v) => updateSimulationPortions(activeRecipe.id, v)}
          breakdown={metrics.breakdown}
          grandTotal={metrics.grandTotal}
          costPerPortion={metrics.costPerPortion}
        />
        <TargetPriceCard
          costPerPortion={metrics.costPerPortion}
          sellingPrice={activeRecipe.sellingPrice}
        />
      </div>

      <div className={styles.contentArea}>
        <Title2>Cost Simulator</Title2>

        <Card className={styles.priceCard} style={{ marginTop: 16 }}>
          <Title3>Selling Price</Title3>
          <div className={styles.priceRow}>
            <Field className={styles.priceInput} label="Price">
              <Input
                type="number"
                value={String(activeRecipe.sellingPrice)}
                onChange={(_, data) =>
                  updateSellingPrice(activeRecipe.id, Number(data.value) || 0)
                }
              />
            </Field>
            <Slider
              className={styles.slider}
              min={0}
              max={Math.round(maxSlider)}
              step={1}
              value={activeRecipe.sellingPrice}
              onChange={(_, data) => updateSellingPrice(activeRecipe.id, data.value)}
            />
          </div>
        </Card>

        <div className={styles.kpiGrid}>
          <StatCard
            icon={<ArrowTrendingLines24Regular />}
            value={metrics.revenue}
            label="Revenue"
            format={(v) => formatMoney(v)}
          />
          <StatCard
            icon={<DataTrending24Regular />}
            value={metrics.profit}
            label="Profit"
            format={(v) => formatMoney(v)}
            trend={profitTrend}
            delay={0.03}
          />
          <StatCard
            icon={<MoneyHand24Regular />}
            value={metrics.profitPerPortion}
            label="Profit Per Portion"
            format={(v) => formatMoney(v)}
            trend={profitTrend}
            delay={0.06}
          />
          <StatCard
            icon={<DocumentPercent24Regular />}
            value={metrics.margin}
            label="Margin"
            format={formatPercent}
            trend={profitTrend}
            delay={0.09}
          />
          <StatCard
            icon={<ChartMultiple24Regular />}
            value={metrics.markup}
            label="Markup"
            format={formatPercent}
            trend={profitTrend}
            delay={0.12}
          />
        </div>

        <div className={styles.section}>
          <Title3 className={styles.sectionTitle}>Ingredient Prices</Title3>
          <IngredientPricesList
            ingredients={activeRecipe.ingredients}
            scale={scale}
            onPriceChange={(ingredientId, unitPrice) =>
              updateIngredient(activeRecipe.id, ingredientId, { unitPrice })
            }
          />
        </div>

        <div className={styles.section}>
          <Title3 className={styles.sectionTitle}>Other Costs</Title3>
          <div className={styles.otherCostsGrid}>
            <OtherCostCard
              icon={<Box24Regular />}
              label="Packaging"
              item={activeRecipe.packaging}
              portions={activeRecipe.simulationPortions}
              onChange={(item) => updateCostItem(activeRecipe.id, 'packaging', item)}
            />
            <OtherCostCard
              icon={<VehicleTruckProfile24Regular />}
              label="Transport"
              item={activeRecipe.transport}
              portions={activeRecipe.simulationPortions}
              onChange={(item) => updateCostItem(activeRecipe.id, 'transport', item)}
            />
            <OtherCostCard
              icon={<Toolbox24Regular />}
              label="Labor"
              item={activeRecipe.labor}
              portions={activeRecipe.simulationPortions}
              onChange={(item) => updateCostItem(activeRecipe.id, 'labor', item)}
            />
            <OtherCostCard
              icon={<Wrench24Regular />}
              label="Utilities"
              item={activeRecipe.utilities}
              portions={activeRecipe.simulationPortions}
              onChange={(item) => updateCostItem(activeRecipe.id, 'utilities', item)}
            />
            <OtherCostCard
              icon={<Sparkle24Regular />}
              label="Miscellaneous"
              item={activeRecipe.miscellaneous}
              portions={activeRecipe.simulationPortions}
              onChange={(item) => updateCostItem(activeRecipe.id, 'miscellaneous', item)}
            />
          </div>
        </div>

        <div className={styles.section}>
          <Title3 className={styles.sectionTitle}>Pricing Suggestions</Title3>
          <Card>
            <PricingSuggestionsGrid
              suggestions={suggestions}
              currentPrice={activeRecipe.sellingPrice}
              onSelect={(price) => updateSellingPrice(activeRecipe.id, price)}
            />
          </Card>
        </div>

        <div className={styles.chartsGrid}>
          <Card className={styles.chartCard}>
            <Title3>Profit Simulator</Title3>
            <ProfitLineChart data={profitSeries} currentPrice={activeRecipe.sellingPrice} />
          </Card>
          <Card className={styles.chartCard}>
            <Title3>Cost Breakdown</Title3>
            <CostPieChart breakdown={metrics.breakdown} />
          </Card>
        </div>
      </div>
    </div>
  );
}
