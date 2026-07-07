import { useMemo } from 'react';
import { Button, Card, Checkbox, Input, Text, Title2, Title3, makeStyles, tokens } from '@fluentui/react-components';
import {
  ArrowTrendingLines24Regular,
  Box24Regular,
  ChartMultiple24Regular,
  DataTrending24Regular,
  Delete24Regular,
  DocumentPercent24Regular,
  Money24Regular,
  Sparkle24Regular,
  Toolbox24Regular,
  VehicleTruckProfile24Regular,
  Wrench24Regular,
} from '@fluentui/react-icons';
import { useMenusStore } from '@/features/menus/MenusContext';
import { computeEventTotals, type MenuSelection } from '@/features/costing/calculations';
import { useIngredientCatalog } from '@/features/ingredientCatalog/IngredientCatalogContext';
import { useSimulationSelection } from '@/features/simulator/useSimulationSelection';
import { useSimulatorCosts } from '@/features/simulator/useSimulatorCosts';
import { formatMoney, formatPercent } from '@/shared/lib/currency';
import { StatCard } from '@/shared/components/StatCard';
import { TargetPriceCard } from '@/features/simulator/components/TargetPriceCard';
import { IngredientPriceSheet } from '@/features/simulator/components/IngredientPriceSheet';
import { OtherCostCard } from '@/features/simulator/components/OtherCostCard';
import { CostPieChart } from '@/features/simulator/components/CostPieChart';

const useStyles = makeStyles({
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '20px',
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
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  menuRow: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    marginBottom: '8px',
  },
  menuRowDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0,
  },
  menuName: {
    fontWeight: tokens.fontWeightSemibold,
    flex: '2 1 140px',
    minWidth: 0,
  },
  menuQtyInput: {
    flex: '1 1 100px',
    minWidth: '90px',
  },
  menuPriceInput: {
    flex: '1 1 110px',
    minWidth: '90px',
  },
  otherCostsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    '@media (min-width: 560px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  chartCard: {
    padding: '20px',
    maxWidth: '480px',
  },
  empty: {
    padding: '32px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
});

export function SimulatorPage() {
  const styles = useStyles();
  const { menus, updatePreferredSellPrice } = useMenusStore();
  const { entries, isIncluded, toggleMenu, setQuantity, clear } = useSimulationSelection();
  const { otherCosts, updateCost } = useSimulatorCosts();
  const { getPrice } = useIngredientCatalog();

  const selectedMenus = useMemo(
    () =>
      entries
        .map((e) => menus.find((m) => m.id === e.menuId))
        .filter((m): m is NonNullable<typeof m> => m !== undefined),
    [entries, menus]
  );

  const selections: MenuSelection[] = useMemo(
    () =>
      entries
        .map((e) => {
          const menu = menus.find((m) => m.id === e.menuId);
          if (!menu) return null;
          return { menu, quantity: e.quantity, sellPrice: menu.preferredSellPrice };
        })
        .filter((s): s is MenuSelection => s !== null),
    [entries, menus]
  );

  const totals = useMemo(
    () => computeEventTotals(selections, otherCosts, (name) => getPrice(name)),
    [selections, otherCosts, getPrice]
  );

  const averageSellPrice = totals.totalPortions > 0 ? totals.totalRevenue / totals.totalPortions : 0;
  const profitTrend = totals.totalProfit >= 0 ? 'positive' : 'negative';

  return (
    <div>
      <Title2>Cost Simulator</Title2>

      <div className={styles.kpiGrid} style={{ marginTop: 16 }}>
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
          trend={profitTrend}
          delay={0.06}
        />
        <StatCard
          icon={<DocumentPercent24Regular />}
          value={totals.margin}
          label="Margin %"
          format={formatPercent}
          trend={profitTrend}
          delay={0.09}
        />
        <StatCard
          icon={<ChartMultiple24Regular />}
          value={totals.markup}
          label="Markup %"
          format={formatPercent}
          trend={profitTrend}
          delay={0.12}
        />
      </div>

      <div className={styles.section}>
        <TargetPriceCard costPerPortion={totals.costPerPortion} sellingPrice={averageSellPrice} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Title3>Menus in this simulation</Title3>
          {entries.length > 0 ? (
            <Button appearance="subtle" icon={<Delete24Regular />} onClick={clear}>
              Clear all
            </Button>
          ) : null}
        </div>
        {menus.length === 0 ? (
          <Card className={styles.empty}>No menus yet.</Card>
        ) : (
          menus.map((menu) => {
            const included = isIncluded(menu.id);
            const entry = entries.find((e) => e.menuId === menu.id);
            return (
              <Card key={menu.id} className={styles.menuRow}>
                <Checkbox
                  checked={included}
                  onChange={() => toggleMenu(menu.id, menu.portions)}
                />
                <div className={styles.menuRowDetails}>
                  <Text className={styles.menuName}>{menu.name}</Text>
                  {included && entry ? (
                    <>
                      <Input
                        className={styles.menuQtyInput}
                        type="number"
                        contentBefore={<Text size={200}>Qty</Text>}
                        value={String(entry.quantity)}
                        onChange={(_, data) => setQuantity(menu.id, Number(data.value) || 0)}
                      />
                      <Input
                        className={styles.menuPriceInput}
                        type="number"
                        contentBefore={<Text size={200}>DA</Text>}
                        value={String(menu.preferredSellPrice)}
                        onChange={(_, data) =>
                          updatePreferredSellPrice(menu.id, Number(data.value) || 0)
                        }
                      />
                    </>
                  ) : (
                    <Text className={styles.empty} style={{ padding: 0 }}>
                      Not included
                    </Text>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div className={styles.section}>
        <Title3 style={{ marginBottom: 12, display: 'block' }}>Ingredient Prices</Title3>
        <IngredientPriceSheet menus={selectedMenus} />
      </div>

      <div className={styles.section}>
        <Title3 style={{ marginBottom: 12, display: 'block' }}>Other Costs</Title3>
        <div className={styles.otherCostsGrid}>
          <OtherCostCard
            icon={<Box24Regular />}
            label="Packaging"
            item={otherCosts.packaging}
            portions={totals.totalPortions}
            onChange={(item) => updateCost('packaging', item)}
          />
          <OtherCostCard
            icon={<VehicleTruckProfile24Regular />}
            label="Transport"
            item={otherCosts.transport}
            portions={totals.totalPortions}
            onChange={(item) => updateCost('transport', item)}
          />
          <OtherCostCard
            icon={<Toolbox24Regular />}
            label="Labor"
            item={otherCosts.labor}
            portions={totals.totalPortions}
            onChange={(item) => updateCost('labor', item)}
          />
          <OtherCostCard
            icon={<Wrench24Regular />}
            label="Utilities"
            item={otherCosts.utilities}
            portions={totals.totalPortions}
            onChange={(item) => updateCost('utilities', item)}
          />
          <OtherCostCard
            icon={<Sparkle24Regular />}
            label="Miscellaneous"
            item={otherCosts.miscellaneous}
            portions={totals.totalPortions}
            onChange={(item) => updateCost('miscellaneous', item)}
          />
        </div>
      </div>

      <div className={styles.section}>
        <Title3 style={{ marginBottom: 12, display: 'block' }}>Cost Breakdown</Title3>
        <Card className={styles.chartCard}>
          <CostPieChart breakdown={totals.breakdown} />
        </Card>
      </div>
    </div>
  );
}
