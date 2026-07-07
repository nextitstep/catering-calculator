import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  createTableColumn,
  type TableColumnDefinition,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import type { PricingSuggestion } from '@/features/costing/calculations';
import { formatMoney, formatPercent } from '@/shared/lib/currency';

const useStyles = makeStyles({
  row: {
    cursor: 'pointer',
  },
  activeRow: {
    backgroundColor: tokens.colorBrandBackground2,
  },
});

interface PricingSuggestionsGridProps {
  suggestions: PricingSuggestion[];
  currentPrice: number;
  onSelect: (price: number) => void;
}

export function PricingSuggestionsGrid({
  suggestions,
  currentPrice,
  onSelect,
}: PricingSuggestionsGridProps) {
  const styles = useStyles();

  const columns: TableColumnDefinition<PricingSuggestion>[] = [
    createTableColumn<PricingSuggestion>({
      columnId: 'label',
      renderHeaderCell: () => 'Tier',
      renderCell: (item) => item.label,
    }),
    createTableColumn<PricingSuggestion>({
      columnId: 'sellingPrice',
      renderHeaderCell: () => 'Selling Price',
      renderCell: (item) => formatMoney(item.sellingPrice),
    }),
    createTableColumn<PricingSuggestion>({
      columnId: 'profitPerPortion',
      renderHeaderCell: () => 'Profit / Portion',
      renderCell: (item) => formatMoney(item.profitPerPortion),
    }),
    createTableColumn<PricingSuggestion>({
      columnId: 'margin',
      renderHeaderCell: () => 'Margin',
      renderCell: (item) => formatPercent(item.margin),
    }),
    createTableColumn<PricingSuggestion>({
      columnId: 'markup',
      renderHeaderCell: () => 'Markup',
      renderCell: (item) => formatPercent(item.markup),
    }),
  ];

  return (
    <DataGrid
      items={suggestions}
      columns={columns}
      getRowId={(item) => item.label}
      resizableColumns={false}
    >
      <DataGridHeader>
        <DataGridRow>
          {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
        </DataGridRow>
      </DataGridHeader>
      <DataGridBody<PricingSuggestion>>
        {({ item, rowId }) => (
          <DataGridRow<PricingSuggestion>
            key={rowId}
            className={
              Math.abs(item.sellingPrice - currentPrice) < 0.01 ? styles.activeRow : styles.row
            }
            onClick={() => onSelect(item.sellingPrice)}
          >
            {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
  );
}
