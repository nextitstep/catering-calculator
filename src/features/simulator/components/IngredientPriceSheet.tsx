import { useMemo } from 'react';
import { Card, Input, Text, makeStyles, tokens } from '@fluentui/react-components';
import type { Menu, Unit } from '@/types';
import { useIngredientCatalog } from '@/features/ingredientCatalog/IngredientCatalogContext';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 14px',
    marginBottom: '8px',
  },
  info: {
    flex: '2 1 160px',
    minWidth: 0,
  },
  price: {
    flex: '1 1 130px',
    minWidth: '110px',
  },
  name: {
    fontWeight: tokens.fontWeightSemibold,
  },
  unit: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
});

interface IngredientPriceSheetProps {
  menus: Menu[];
}

export function IngredientPriceSheet({ menus }: IngredientPriceSheetProps) {
  const styles = useStyles();
  const { getPrice, remember } = useIngredientCatalog();

  const uniqueIngredients = useMemo(() => {
    const seen = new Map<string, { name: string; unit: Unit; customUnit?: string }>();
    for (const menu of menus) {
      for (const ing of menu.ingredients) {
        const key = ing.name.trim().toLowerCase();
        if (key && !seen.has(key)) {
          seen.set(key, { name: ing.name, unit: ing.unit, customUnit: ing.customUnit });
        }
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [menus]);

  if (uniqueIngredients.length === 0) {
    return <Card className={styles.empty}>Select a menu to price its ingredients.</Card>;
  }

  return (
    <div>
      {uniqueIngredients.map((ing) => (
        <Card key={ing.name.toLowerCase()} className={styles.row}>
          <div className={styles.info}>
            <div className={styles.name}>{ing.name}</div>
            <div className={styles.unit}>per {ing.unit === 'custom' ? ing.customUnit : ing.unit}</div>
          </div>
          <Input
            className={styles.price}
            type="number"
            contentBefore={<Text size={200}>DA</Text>}
            value={String(getPrice(ing.name))}
            onChange={(_, data) =>
              remember(ing.name, ing.unit, ing.customUnit, Number(data.value) || 0)
            }
          />
        </Card>
      ))}
    </div>
  );
}
