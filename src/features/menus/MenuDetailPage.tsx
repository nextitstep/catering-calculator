import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Reorder } from 'framer-motion';
import {
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Title2,
  makeStyles,
} from '@fluentui/react-components';
import { Add24Filled, ArrowLeft24Regular } from '@fluentui/react-icons';
import { useMenusStore } from '@/features/menus/MenusContext';
import { IngredientRow } from '@/features/menus/components/IngredientRow';
import type { MenuIngredient } from '@/types';

const useStyles = makeStyles({
  root: {
    maxWidth: '720px',
    margin: '0 auto',
  },
  backRow: {
    marginBottom: '12px',
  },
  titleCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  fieldsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    '@media (min-width: 480px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  empty: {
    padding: '32px',
    textAlign: 'center',
  },
});

export function MenuDetailPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { menuId } = useParams<{ menuId: string }>();
  const {
    menus,
    updateMenu,
    updatePortions,
    updatePreferredSellPrice,
    addIngredient,
    updateIngredient,
    removeIngredient,
    markOpened,
  } = useMenusStore();

  const menu = menus.find((m) => m.id === menuId);

  useEffect(() => {
    if (menuId) markOpened(menuId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId]);

  if (!menu) {
    return (
      <Card className={styles.empty}>
        <Title2>Menu not found</Title2>
        <Button appearance="primary" onClick={() => navigate('/menus')} style={{ marginTop: 12 }}>
          Back to Menus
        </Button>
      </Card>
    );
  }

  function handleReorder(newOrder: MenuIngredient[]) {
    updateMenu(menu!.id, (m) => ({ ...m, ingredients: newOrder }));
  }

  return (
    <div className={styles.root}>
      <div className={styles.backRow}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/menus')}>
          Back to Menus
        </Button>
      </div>

      <Card className={styles.titleCard}>
        <Field label="Menu name">
          <Input
            value={menu.name}
            onChange={(_, data) => updateMenu(menu.id, (m) => ({ ...m, name: data.value }))}
          />
        </Field>
        <Field label="Description">
          <Textarea
            resize="vertical"
            value={menu.description}
            onChange={(_, data) => updateMenu(menu.id, (m) => ({ ...m, description: data.value }))}
          />
        </Field>
        <div className={styles.fieldsRow}>
          <Field label="Portions (this menu as written)">
            <Input
              type="number"
              value={String(menu.portions)}
              onChange={(_, data) => updatePortions(menu.id, Number(data.value) || 0)}
            />
          </Field>
          <Field label="Preferred Sell Price">
            <Input
              type="number"
              contentBefore="DA"
              value={String(menu.preferredSellPrice)}
              onChange={(_, data) => updatePreferredSellPrice(menu.id, Number(data.value) || 0)}
            />
          </Field>
        </div>
      </Card>

      <div className={styles.header}>
        <Title2>Ingredients</Title2>
        <Button appearance="primary" icon={<Add24Filled />} onClick={() => addIngredient(menu.id)}>
          Add Ingredient
        </Button>
      </div>

      {menu.ingredients.length === 0 ? (
        <Card className={styles.empty}>No ingredients yet. Add your first one.</Card>
      ) : (
        <Reorder.Group
          axis="y"
          values={menu.ingredients}
          onReorder={handleReorder}
          style={{ padding: 0, margin: 0 }}
        >
          {menu.ingredients.map((ingredient) => (
            <IngredientRow
              key={ingredient.id}
              ingredient={ingredient}
              onChange={(partial) => updateIngredient(menu.id, ingredient.id, partial)}
              onDelete={() => removeIngredient(menu.id, ingredient.id)}
            />
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
