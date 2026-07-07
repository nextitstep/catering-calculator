import { Reorder, useDragControls } from 'framer-motion';
import { Button, Dropdown, Input, Option, makeStyles, tokens } from '@fluentui/react-components';
import { Delete24Regular, ReOrderDotsVertical24Regular } from '@fluentui/react-icons';
import type { Ingredient, Unit } from '@/types';
import { UNIT_OPTIONS } from '@/types';

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
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '8px',
    '@media (min-width: 480px)': {
      gridTemplateColumns: '2fr 1fr 1fr auto',
      alignItems: 'end',
    },
  },
  deleteRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    '@media (min-width: 480px)': {
      justifyContent: 'center',
    },
  },
});

interface IngredientCardProps {
  ingredient: Ingredient;
  onChange: (partial: Partial<Ingredient>) => void;
  onDelete: () => void;
}

export function IngredientCard({ ingredient, onChange, onDelete }: IngredientCardProps) {
  const styles = useStyles();
  const controls = useDragControls();

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
          <Input
            placeholder="Ingredient name"
            value={ingredient.name}
            onChange={(_, data) => onChange({ name: data.value })}
          />
          <Input
            type="number"
            placeholder="Qty"
            value={String(ingredient.quantity)}
            onChange={(_, data) => onChange({ quantity: Number(data.value) || 0 })}
          />
          <Dropdown
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
          <div className={styles.deleteRow}>
            <Button
              appearance="subtle"
              size="small"
              icon={<Delete24Regular />}
              onClick={onDelete}
              aria-label="Delete ingredient"
            />
          </div>
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
