import { Reorder } from 'framer-motion';
import { Button, Card, Field, Input, Title2, makeStyles } from '@fluentui/react-components';
import { Add24Filled } from '@fluentui/react-icons';
import { useRecipesStore } from '@/features/recipes/RecipesContext';
import { IngredientCard } from '@/features/ingredients/components/IngredientCard';
import type { Ingredient } from '@/types';

const useStyles = makeStyles({
  root: {
    maxWidth: '720px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  portionsCard: {
    padding: '16px',
    marginBottom: '20px',
    maxWidth: '260px',
  },
  fab: {
    position: 'fixed',
    right: '20px',
    bottom: '84px',
    zIndex: 90,
    '@media (min-width: 720px)': {
      display: 'none',
    },
  },
  empty: {
    padding: '32px',
    textAlign: 'center',
  },
});

export function IngredientsPage() {
  const styles = useStyles();
  const {
    activeRecipe,
    updateIngredient,
    removeIngredient,
    addIngredient,
    updateRecipe,
    updatePortions,
  } = useRecipesStore();

  if (!activeRecipe) {
    return (
      <Card className={styles.empty}>
        <Title2>No recipe selected</Title2>
      </Card>
    );
  }

  function handleReorder(newOrder: Ingredient[]) {
    updateRecipe(activeRecipe!.id, (r) => ({ ...r, ingredients: newOrder }));
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Title2>Ingredients</Title2>
        <Button
          appearance="primary"
          icon={<Add24Filled />}
          onClick={() => addIngredient(activeRecipe.id)}
        >
          Add Ingredient
        </Button>
      </div>

      <Card className={styles.portionsCard}>
        <Field label="Portions (this recipe as written)">
          <Input
            type="number"
            value={String(activeRecipe.portions)}
            onChange={(_, data) => updatePortions(activeRecipe.id, Number(data.value) || 0)}
          />
        </Field>
      </Card>

      {activeRecipe.ingredients.length === 0 ? (
        <Card className={styles.empty}>No ingredients yet. Add your first one.</Card>
      ) : (
        <Reorder.Group
          axis="y"
          values={activeRecipe.ingredients}
          onReorder={handleReorder}
          style={{ padding: 0, margin: 0 }}
        >
          {activeRecipe.ingredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              onChange={(partial) => updateIngredient(activeRecipe.id, ingredient.id, partial)}
              onDelete={() => removeIngredient(activeRecipe.id, ingredient.id)}
            />
          ))}
        </Reorder.Group>
      )}

      <Button
        className={styles.fab}
        appearance="primary"
        shape="circular"
        size="large"
        icon={<Add24Filled />}
        onClick={() => addIngredient(activeRecipe.id)}
        aria-label="Add Ingredient"
      />
    </div>
  );
}
