import {
  Card,
  Field,
  Input,
  ProgressBar,
  Text,
  Title3,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { AnimatedNumber } from '@/shared/components/AnimatedNumber';
import { formatMoney } from '@/shared/lib/currency';
import type { CostBreakdown } from '@/features/costing/calculations';

const useStyles = makeStyles({
  card: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    position: 'sticky',
    top: '72px',
  },
  bigValue: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightSemibold,
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
});

interface CostSummaryCardProps {
  simulationPortions: number;
  onSimulationPortionsChange: (value: number) => void;
  breakdown: CostBreakdown;
  grandTotal: number;
  costPerPortion: number;
}

export function CostSummaryCard({
  simulationPortions,
  onSimulationPortionsChange,
  breakdown,
  grandTotal,
  costPerPortion,
}: CostSummaryCardProps) {
  const styles = useStyles();
  const rows: [string, number][] = [
    ['Ingredients', breakdown.ingredients],
    ['Packaging', breakdown.packaging],
    ['Transport', breakdown.transport],
    ['Labor', breakdown.labor],
    ['Utilities', breakdown.utilities],
    ['Miscellaneous', breakdown.miscellaneous],
  ];
  const max = Math.max(grandTotal, 1);

  return (
    <Card className={styles.card}>
      <Title3>Summary</Title3>
      <Field label="Portions to Produce">
        <Input
          type="number"
          value={String(simulationPortions)}
          onChange={(_, data) => onSimulationPortionsChange(Number(data.value) || 0)}
        />
      </Field>
      <div>
        <Text size={200}>Grand Total</Text>
        <div className={styles.bigValue}>
          <AnimatedNumber value={grandTotal} format={(v) => formatMoney(v)} />
        </div>
      </div>
      <div>
        <Text size={200}>Cost Per Portion</Text>
        <div className={styles.bigValue}>
          <AnimatedNumber value={costPerPortion} format={(v) => formatMoney(v)} />
        </div>
      </div>
      <div>
        {rows.map(([label, value]) => (
          <div key={label} style={{ marginBottom: 6 }}>
            <div className={styles.breakdownRow}>
              <span>{label}</span>
              <span>{formatMoney(value)}</span>
            </div>
            <ProgressBar value={value / max} thickness="medium" />
          </div>
        ))}
      </div>
    </Card>
  );
}
