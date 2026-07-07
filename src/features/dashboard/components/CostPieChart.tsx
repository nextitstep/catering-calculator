import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CostBreakdown } from '@/features/costing/calculations';
import { formatMoney } from '@/shared/lib/currency';

interface CostPieChartProps {
  breakdown: CostBreakdown;
}

const COLORS = ['#0078D4', '#2699F1', '#6FB5EA', '#B3D2E9', '#8AC0A2', '#F2A65A'];

export function CostPieChart({ breakdown }: CostPieChartProps) {
  const data = [
    { name: 'Ingredients', value: breakdown.ingredients },
    { name: 'Packaging', value: breakdown.packaging },
    { name: 'Transport', value: breakdown.transport },
    { name: 'Labor', value: breakdown.labor },
    { name: 'Utilities', value: breakdown.utilities },
    { name: 'Misc.', value: breakdown.miscellaneous },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatMoney(Number(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
