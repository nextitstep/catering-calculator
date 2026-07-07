import { Reorder, useDragControls } from 'framer-motion';
import { Button, Combobox, Dropdown, Input, Option, makeStyles, tokens } from '@fluentui/react-components';
import { Delete24Regular, ReOrderDotsVertical24Regular } from '@fluentui/react-icons';
import type { MenuIngredient, Unit } from '@/types';
import { UNIT_OPTIONS } from '@/types';
import { useIngredientCatalog } from '@/features/ingredientCatalog/IngredientCatalogContext';

const useStyles = makeStyles({
  card: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
    gap: '10px',
    padding: '14px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
    marginBottom: '10px',
  },
  handle: {
    cursor: 'grab',
    color: tokens.colorNeutralForeground3,
    touchAction: 'none',
  },
  fields: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
  },
  name: {
    flex: '3 1 160px',
    minWidth: 0,
  },
  qty: {
    flex: '1 1 70px',
    minWidth: '64px',
  },
  unit: {
    flex: '1 1 90px',
    minWidth: '80px',
  },
  deleteRow: {
    flex: '0 0 auto',
    marginLeft: 'auto',
  },
});

interface IngredientRowProps {
  ingredient: MenuIngredient;
  onChange: (partial: Partial<MenuIngredient>) => void;
  onDelete: () => void;
}

export function IngredientRow({ ingredient, onChange, onDelete }: IngredientRowProps) {
  const styles = useStyles();
  const controls = useDragControls();
  const { suggestions, remember } = useIngredientCatalog();
  const matches = suggestions(ingredient.name);

  return (
    <Reorder.Item
      value={ingredient}
      dragListener={false}
      dragControls={controls}
      className={styles.card}
      style={{ listStyle: 'none' }}
    >
      <div
        className={styles.handle}
        onPointerDown={(e) => controls.start(e)}
        aria-label="Drag to reorder"
      >
        <ReOrderDotsVertical24Regular />
      </div>
      <div>
        <div className={styles.fields}>
          <Combobox
            className={styles.name}
            freeform
            placeholder="Ingredient name"
            value={ingredient.name}
            onChange={(e) => onChange({ name: e.target.value })}
            onOptionSelect={(_, data) => {
              if (!data.optionText) return;
              const match = matches.find((m) => m.name === data.optionText);
              onChange({ name: data.optionText, unit: match?.unit ?? ingredient.unit });
            }}
            onBlur={() => {
              if (ingredient.name.trim()) remember(ingredient.name, ingredient.unit, ingredient.customUnit);
            }}
          >
            {matches.map((s) => (
              <Option key={s.name} text={s.name}>
                {s.name}
              </Option>
            ))}
          </Combobox>
          <Input
            className={styles.qty}
            type="number"
            placeholder="Qty"
            value={String(ingredient.quantity)}
            onChange={(_, data) => onChange({ quantity: Number(data.value) || 0 })}
          />
          <Dropdown
            className={styles.unit}
            value={ingredient.unit}
            selectedOptions={[ingredient.unit]}
            onOptionSelect={(_, data) =>
              data.optionValue && onChange({ unit: data.optionValue as Unit })
            }
          >
            {UNIT_OPTIONS.map((u) => (
              <Option key={u} value={u}>
                {u}
              </Option>
            ))}
          </Dropdown>
          <Button
            className={styles.deleteRow}
            appearance="subtle"
            size="small"
            icon={<Delete24Regular />}
            onClick={onDelete}
            aria-label="Delete ingredient"
          />
        </div>
        {ingredient.unit === 'custom' ? (
          <Input
            style={{ marginTop: '8px' }}
            placeholder="Custom unit label"
            value={ingredient.customUnit ?? ''}
            onChange={(_, data) => onChange({ customUnit: data.value })}
          />
        ) : null}
      </div>
    </Reorder.Item>
  );
}
