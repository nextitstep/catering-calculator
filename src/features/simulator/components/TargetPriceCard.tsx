import { Badge, Card, ProgressBar, Text, Title3, makeStyles, tokens } from '@fluentui/react-components';
import { TARGET_MULTIPLIER } from '@/features/costing/calculations';
import { formatMoney } from '@/shared/lib/currency';

const useStyles = makeStyles({
  card: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  row: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  },
  targetValue: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
  },
  caption: {
    color: tokens.colorNeutralForeground3,
  },
});

interface TargetPriceCardProps {
  costPerPortion: number;
  sellingPrice: number;
}

export function TargetPriceCard({ costPerPortion, sellingPrice }: TargetPriceCardProps) {
  const styles = useStyles();
  const targetPrice = costPerPortion * TARGET_MULTIPLIER;
  const ratio = costPerPortion > 0 ? sellingPrice / costPerPortion : 0;
  const progress = targetPrice > 0 ? Math.min(sellingPrice / targetPrice, 1) : 0;

  let status: 'below' | 'onTarget' | 'above';
  let color: 'danger' | 'warning' | 'success';
  if (ratio >= TARGET_MULTIPLIER * 1.05) {
    status = 'above';
    color = 'success';
  } else if (ratio >= TARGET_MULTIPLIER * 0.98) {
    status = 'onTarget';
    color = 'success';
  } else {
    status = 'below';
    color = ratio >= TARGET_MULTIPLIER * 0.6 ? 'warning' : 'danger';
  }

  const statusLabel = {
    below: 'Below Target',
    onTarget: 'On Target',
    above: 'Above Target',
  }[status];

  return (
    <Card className={styles.card}>
      <div className={styles.row}>
        <Title3>Target Price (3x Cost)</Title3>
        <Badge color={color} appearance="filled">
          {statusLabel}
        </Badge>
      </div>
      <div className={styles.row}>
        <Text className={styles.targetValue}>{formatMoney(targetPrice)}</Text>
        <Text className={styles.caption}>current: {ratio.toFixed(2)}x cost</Text>
      </div>
      <ProgressBar
        value={progress}
        thickness="large"
        color={color === 'danger' ? 'error' : color}
      />
    </Card>
  );
}
