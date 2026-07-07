import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { tokens } from '@fluentui/react-components';
import type { ProfitSimPoint } from '@/features/costing/calculations';
import { formatMoney } from '@/shared/lib/currency';

interface ProfitLineChartProps {
  data: ProfitSimPoint[];
  currentPrice?: number;
}

export function ProfitLineChart({ data, currentPrice }: ProfitLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={tokens.colorNeutralStroke2} />
        <XAxis
          dataKey="sellingPrice"
          tick={{ fontSize: 12 }}
          tickFormatter={(v: number) => formatMoney(v)}
        />
        <YAxis tick={{ fontSize: 12 }} width={56} />
        <Tooltip
          formatter={(value) => formatMoney(Number(value))}
          labelFormatter={(label) => `Price: ${formatMoney(Number(label))}`}
        />
        <ReferenceLine y={0} stroke={tokens.colorNeutralStroke1} />
        {currentPrice !== undefined ? (
          <ReferenceLine
            x={currentPrice}
            stroke={tokens.colorPaletteGreenForeground1}
            strokeDasharray="4 4"
          />
        ) : null}
        <Line
          type="monotone"
          dataKey="profit"
          stroke={tokens.colorBrandBackground}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
