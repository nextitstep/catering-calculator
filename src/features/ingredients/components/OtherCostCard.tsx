import { Card, Field, Input, Switch, Text, makeStyles, tokens } from '@fluentui/react-components';
import type { ReactNode } from 'react';
import type { CostItem } from '@/types';
import { costItemTotal } from '@/features/costing/calculations';
import { formatMoney } from '@/shared/lib/currency';

const useStyles = makeStyles({
  card: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: tokens.fontWeightSemibold,
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  total: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
});

interface OtherCostCardProps {
  icon: ReactNode;
  label: string;
  item: CostItem;
  portions: number;
  onChange: (item: CostItem) => void;
}

export function OtherCostCard({ icon, label, item, portions, onChange }: OtherCostCardProps) {
  const styles = useStyles();
  const total = costItemTotal(item, portions);

  return (
    <Card className={styles.card}>
      <div className={styles.titleRow}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={styles.toggleRow}>
        <Text size={200}>{item.mode === 'perPortion' ? 'Per Portion' : 'Fixed'}</Text>
        <Switch
          checked={item.mode === 'perPortion'}
          onChange={(_, data) =>
            onChange({ ...item, mode: data.checked ? 'perPortion' : 'fixed' })
          }
          label={undefined}
        />
      </div>
      <Field label={item.mode === 'perPortion' ? 'Amount per portion' : 'Fixed amount'}>
        <Input
          type="number"
          value={String(item.value)}
          onChange={(_, data) => onChange({ ...item, value: Number(data.value) || 0 })}
        />
      </Field>
      <Text className={styles.total}>Total: {formatMoney(total)}</Text>
    </Card>
  );
}
