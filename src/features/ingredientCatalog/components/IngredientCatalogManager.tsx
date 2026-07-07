import { useState } from 'react';
import {
  Button,
  Card,
  Dropdown,
  Input,
  Option,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Add24Filled, Delete24Regular } from '@fluentui/react-icons';
import { UNIT_OPTIONS, type Unit } from '@/types';
import { useIngredientCatalog } from '@/features/ingredientCatalog/IngredientCatalogContext';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    marginBottom: '8px',
  },
  name: {
    flex: '2 1 140px',
    minWidth: 0,
  },
  unit: {
    flex: '1 1 90px',
    minWidth: '90px',
  },
  price: {
    flex: '1 1 110px',
    minWidth: '90px',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
});

export function IngredientCatalogManager() {
  const styles = useStyles();
  const { catalog, remember, removeEntry } = useIngredientCatalog();
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState<Unit>('kg');
  const [newPrice, setNewPrice] = useState('0');

  function handleAdd() {
    if (!newName.trim()) return;
    remember(newName.trim(), newUnit, undefined, Number(newPrice) || 0);
    setNewName('');
    setNewPrice('0');
  }

  return (
    <div>
      {catalog.length === 0 ? (
        <Card className={styles.empty}>No ingredients recorded yet.</Card>
      ) : (
        [...catalog]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((entry) => (
            <Card key={entry.name.toLowerCase()} className={styles.row}>
              <Input
                className={styles.name}
                value={entry.name}
                onChange={(_, data) => remember(data.value, entry.unit, entry.customUnit, entry.lastPrice)}
              />
              <Dropdown
                className={styles.unit}
                value={entry.unit}
                selectedOptions={[entry.unit]}
                onOptionSelect={(_, data) =>
                  data.optionValue &&
                  remember(entry.name, data.optionValue as Unit, entry.customUnit, entry.lastPrice)
                }
              >
                {UNIT_OPTIONS.map((u) => (
                  <Option key={u} value={u}>
                    {u}
                  </Option>
                ))}
              </Dropdown>
              <Input
                className={styles.price}
                type="number"
                contentBefore={<Text size={200}>DA</Text>}
                value={String(entry.lastPrice)}
                onChange={(_, data) =>
                  remember(entry.name, entry.unit, entry.customUnit, Number(data.value) || 0)
                }
              />
              <Button
                appearance="subtle"
                icon={<Delete24Regular />}
                aria-label={`Remove ${entry.name}`}
                onClick={() => removeEntry(entry.name)}
              />
            </Card>
          ))
      )}

      <Card className={styles.row}>
        <Input
          className={styles.name}
          placeholder="New ingredient name"
          value={newName}
          onChange={(_, data) => setNewName(data.value)}
        />
        <Dropdown
          className={styles.unit}
          value={newUnit}
          selectedOptions={[newUnit]}
          onOptionSelect={(_, data) => data.optionValue && setNewUnit(data.optionValue as Unit)}
        >
          {UNIT_OPTIONS.map((u) => (
            <Option key={u} value={u}>
              {u}
            </Option>
          ))}
        </Dropdown>
        <Input
          className={styles.price}
          type="number"
          contentBefore={<Text size={200}>DA</Text>}
          value={newPrice}
          onChange={(_, data) => setNewPrice(data.value)}
        />
        <Button appearance="primary" icon={<Add24Filled />} onClick={handleAdd}>
          Add
        </Button>
      </Card>
    </div>
  );
}
