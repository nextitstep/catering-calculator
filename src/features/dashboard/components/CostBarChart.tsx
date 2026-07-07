import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { tokens } from '@fluentui/react-components';
import type { CostBreakdown } from '@/features/costing/calculations';
import { formatMoney } from '@/shared/lib/currency';

interface CostBarChartProps {
  breakdown: CostBreakdown;
}

export function CostBarChart({ breakdown }: CostBarChartProps) {
  const data = [
    { name: 'Ingredients', value: breakdown.ingredients },
    { name: 'Packaging', value: breakdown.packaging },
    { name: 'Transport', value: breakdown.transport },
    { name: 'Labor', value: breakdown.labor },
    { name: 'Utilities', value: breakdown.utilities },
    { name: 'Misc.', value: breakdown.miscellaneous },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={tokens.colorNeutralStroke2} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} width={48} />
        <Tooltip formatter={(value) => formatMoney(Number(value))} />
        <Bar dataKey="value" fill={tokens.colorBrandBackground} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
