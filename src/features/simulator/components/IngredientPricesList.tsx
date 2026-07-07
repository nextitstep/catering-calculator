import { Card, Input, Text, makeStyles, tokens } from '@fluentui/react-components';
import type { Ingredient } from '@/types';
import { ingredientTotal, round2 } from '@/features/costing/calculations';
import { formatMoney } from '@/shared/lib/currency';

const useStyles = makeStyles({
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '8px',
    padding: '12px 14px',
    marginBottom: '8px',
    '@media (min-width: 560px)': {
      gridTemplateColumns: '2fr 1fr 1fr 1fr',
      alignItems: 'center',
    },
  },
  name: {
    fontWeight: tokens.fontWeightSemibold,
  },
  qty: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  total: {
    fontWeight: tokens.fontWeightSemibold,
    textAlign: 'left',
    '@media (min-width: 560px)': {
      textAlign: 'right',
    },
  },
});

interface IngredientPricesListProps {
  ingredients: Ingredient[];
  scale: number;
  onPriceChange: (ingredientId: string, unitPrice: number) => void;
}

export function IngredientPricesList({
  ingredients,
  scale,
  onPriceChange,
}: IngredientPricesListProps) {
  const styles = useStyles();

  if (ingredients.length === 0) {
    return <Card style={{ padding: 20, textAlign: 'center' }}>No ingredients on this recipe yet.</Card>;
  }

  return (
    <div>
      {ingredients.map((ingredient) => {
        const scaledQty = round2(ingredient.quantity * scale);
        return (
          <Card key={ingredient.id} className={styles.row}>
            <div>
              <div className={styles.name}>{ingredient.name || 'Unnamed ingredient'}</div>
              <div className={styles.qty}>
                {scaledQty} {ingredient.unit === 'custom' ? ingredient.customUnit : ingredient.unit}
              </div>
            </div>
            <Input
              type="number"
              contentBefore={<Text size={200}>DA</Text>}
              placeholder="Unit price"
              value={String(ingredient.unitPrice)}
              onChange={(_, data) => onPriceChange(ingredient.id, Number(data.value) || 0)}
            />
            <Text className={styles.qty}>per {ingredient.unit === 'custom' ? ingredient.customUnit : ingredient.unit}</Text>
            <Text className={styles.total}>
              {formatMoney(ingredientTotal(ingredient, scale))}
            </Text>
          </Card>
        );
      })}
    </div>
  );
}
