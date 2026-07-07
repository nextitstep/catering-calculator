import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CostItem, Ingredient, Recipe, Unit } from '@/types';
import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';
import { createSeedRecipe } from '@/features/recipes/seedData';
import { useCloudSync } from '@/features/sync/useCloudSync';
import { logAnalyticsEvent } from '@/shared/lib/firebase';

const STORAGE_KEY = 'catering-calc/recipes';
const ACTIVE_KEY = 'catering-calc/active-recipe-id';

function blankRecipe(name = 'New Recipe'): Recipe {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    description: '',
    portions: 10,
    simulationPortions: 10,
    ingredients: [],
    packaging: { mode: 'fixed', value: 0 },
    transport: { mode: 'fixed', value: 0 },
    labor: { mode: 'fixed', value: 0 },
    utilities: { mode: 'fixed', value: 0 },
    miscellaneous: { mode: 'fixed', value: 0 },
    sellingPrice: 0,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
  };
}

function blankIngredient(): Ingredient {
  return {
    id: crypto.randomUUID(),
    name: '',
    quantity: 1,
    unit: 'kg' as Unit,
    unitPrice: 0,
  };
}

interface DeletedRecipeState {
  recipe: Recipe;
  index: number;
}

interface RecipesContextValue {
  recipes: Recipe[];
  activeRecipeId: string;
  activeRecipe: Recipe | undefined;
  recentRecipes: Recipe[];
  favoriteRecipes: Recipe[];
  setActiveRecipeId: (id: string) => void;
  createRecipe: (name?: string) => string;
  renameRecipe: (id: string, name: string) => void;
  duplicateRecipe: (id: string) => string;
  deleteRecipe: (id: string) => void;
  undoDelete: () => void;
  pendingDeletion: DeletedRecipeState | null;
  dismissUndo: () => void;
  toggleFavorite: (id: string) => void;
  updateRecipe: (id: string, updater: (recipe: Recipe) => Recipe) => void;
  addIngredient: (recipeId: string) => void;
  updateIngredient: (
    recipeId: string,
    ingredientId: string,
    partial: Partial<Ingredient>
  ) => void;
  removeIngredient: (recipeId: string, ingredientId: string) => void;
  reorderIngredients: (recipeId: string, fromIndex: number, toIndex: number) => void;
  updateCostItem: (
    recipeId: string,
    field: 'packaging' | 'transport' | 'labor' | 'utilities' | 'miscellaneous',
    item: CostItem
  ) => void;
  updatePortions: (recipeId: string, portions: number) => void;
  updateSimulationPortions: (recipeId: string, portions: number) => void;
  updateSellingPrice: (recipeId: string, price: number) => void;
  importRecipe: (recipe: Recipe) => void;
  cloudSync: ReturnType<typeof useCloudSync>;
}

const RecipesContext = createContext<RecipesContextValue | null>(null);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useLocalStorageState<Recipe[]>(STORAGE_KEY, () =>
    [createSeedRecipe()]
  );
  const [activeRecipeId, setActiveRecipeIdRaw] = useLocalStorageState<string>(
    ACTIVE_KEY,
    () => recipes[0]?.id ?? ''
  );
  const [pendingDeletion, setPendingDeletion] = useState<DeletedRecipeState | null>(null);
  const cloudSync = useCloudSync(recipes, setRecipes);

  // Backfill fields added after some users already had data in localStorage.
  useEffect(() => {
    setRecipes((prev) => {
      let changed = false;
      const next = prev.map((r) => {
        if (r.simulationPortions == null) {
          changed = true;
          return { ...r, simulationPortions: r.portions };
        }
        return r;
      });
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const touch = useCallback((recipe: Recipe): Recipe => {
    return { ...recipe, updatedAt: new Date().toISOString() };
  }, []);

  const setActiveRecipeId = useCallback(
    (id: string) => {
      setActiveRecipeIdRaw(id);
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, lastOpenedAt: new Date().toISOString() } : r))
      );
    },
    [setActiveRecipeIdRaw, setRecipes]
  );

  const createRecipe = useCallback(
    (name?: string) => {
      const recipe = blankRecipe(name);
      setRecipes((prev) => [recipe, ...prev]);
      setActiveRecipeId(recipe.id);
      logAnalyticsEvent('recipe_created');
      return recipe.id;
    },
    [setRecipes, setActiveRecipeId]
  );

  const renameRecipe = useCallback(
    (id: string, name: string) => {
      setRecipes((prev) => prev.map((r) => (r.id === id ? touch({ ...r, name }) : r)));
    },
    [setRecipes, touch]
  );

  const duplicateRecipe = useCallback(
    (id: string) => {
      let newId = '';
      setRecipes((prev) => {
        const source = prev.find((r) => r.id === id);
        if (!source) return prev;
        const now = new Date().toISOString();
        const copy: Recipe = {
          ...source,
          id: crypto.randomUUID(),
          name: `${source.name} (Copy)`,
          ingredients: source.ingredients.map((i) => ({ ...i, id: crypto.randomUUID() })),
          favorite: false,
          createdAt: now,
          updatedAt: now,
          lastOpenedAt: now,
        };
        newId = copy.id;
        const sourceIndex = prev.findIndex((r) => r.id === id);
        const next = [...prev];
        next.splice(sourceIndex + 1, 0, copy);
        return next;
      });
      if (newId) setActiveRecipeId(newId);
      logAnalyticsEvent('recipe_duplicated');
      return newId;
    },
    [setRecipes, setActiveRecipeId]
  );

  const deleteRecipe = useCallback(
    (id: string) => {
      setRecipes((prev) => {
        const index = prev.findIndex((r) => r.id === id);
        if (index === -1) return prev;
        setPendingDeletion({ recipe: prev[index], index });
        const next = prev.filter((r) => r.id !== id);
        if (activeRecipeId === id && next.length > 0) {
          setActiveRecipeId(next[0].id);
        }
        return next;
      });
      logAnalyticsEvent('recipe_deleted');
    },
    [setRecipes, activeRecipeId, setActiveRecipeId]
  );

  const undoDelete = useCallback(() => {
    setPendingDeletion((pending) => {
      if (!pending) return pending;
      setRecipes((prev) => {
        const next = [...prev];
        next.splice(pending.index, 0, pending.recipe);
        return next;
      });
      setActiveRecipeId(pending.recipe.id);
      return null;
    });
  }, [setRecipes, setActiveRecipeId]);

  const dismissUndo = useCallback(() => setPendingDeletion(null), []);

  const toggleFavorite = useCallback(
    (id: string) => {
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? touch({ ...r, favorite: !r.favorite }) : r))
      );
    },
    [setRecipes, touch]
  );

  const updateRecipe = useCallback(
    (id: string, updater: (recipe: Recipe) => Recipe) => {
      setRecipes((prev) => prev.map((r) => (r.id === id ? touch(updater(r)) : r)));
    },
    [setRecipes, touch]
  );

  const addIngredient = useCallback(
    (recipeId: string) => {
      updateRecipe(recipeId, (r) => ({
        ...r,
        ingredients: [...r.ingredients, blankIngredient()],
      }));
    },
    [updateRecipe]
  );

  const updateIngredient = useCallback(
    (recipeId: string, ingredientId: string, partial: Partial<Ingredient>) => {
      updateRecipe(recipeId, (r) => ({
        ...r,
        ingredients: r.ingredients.map((i) =>
          i.id === ingredientId ? { ...i, ...partial } : i
        ),
      }));
    },
    [updateRecipe]
  );

  const removeIngredient = useCallback(
    (recipeId: string, ingredientId: string) => {
      updateRecipe(recipeId, (r) => ({
        ...r,
        ingredients: r.ingredients.filter((i) => i.id !== ingredientId),
      }));
    },
    [updateRecipe]
  );

  const reorderIngredients = useCallback(
    (recipeId: string, fromIndex: number, toIndex: number) => {
      updateRecipe(recipeId, (r) => {
        const next = [...r.ingredients];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return { ...r, ingredients: next };
      });
    },
    [updateRecipe]
  );

  const updateCostItem = useCallback(
    (
      recipeId: string,
      field: 'packaging' | 'transport' | 'labor' | 'utilities' | 'miscellaneous',
      item: CostItem
    ) => {
      updateRecipe(recipeId, (r) => ({ ...r, [field]: item }));
    },
    [updateRecipe]
  );

  const updatePortions = useCallback(
    (recipeId: string, portions: number) => {
      const next = Math.max(0, portions);
      updateRecipe(recipeId, (r) => ({
        ...r,
        // Keep the scenario portions following the master batch size until the user
        // deliberately customizes them in the Simulator.
        simulationPortions: r.simulationPortions === r.portions ? next : r.simulationPortions,
        portions: next,
      }));
    },
    [updateRecipe]
  );

  const updateSimulationPortions = useCallback(
    (recipeId: string, portions: number) => {
      updateRecipe(recipeId, (r) => ({ ...r, simulationPortions: Math.max(0, portions) }));
    },
    [updateRecipe]
  );

  const updateSellingPrice = useCallback(
    (recipeId: string, price: number) => {
      updateRecipe(recipeId, (r) => ({ ...r, sellingPrice: Math.max(0, price) }));
    },
    [updateRecipe]
  );

  const importRecipe = useCallback(
    (recipe: Recipe) => {
      const now = new Date().toISOString();
      const imported: Recipe = {
        ...recipe,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        lastOpenedAt: now,
      };
      setRecipes((prev) => [imported, ...prev]);
      setActiveRecipeId(imported.id);
    },
    [setRecipes, setActiveRecipeId]
  );

  const activeRecipe = useMemo(
    () => recipes.find((r) => r.id === activeRecipeId),
    [recipes, activeRecipeId]
  );

  const recentRecipes = useMemo(
    () =>
      [...recipes]
        .sort((a, b) => (b.lastOpenedAt ?? b.updatedAt).localeCompare(a.lastOpenedAt ?? a.updatedAt))
        .slice(0, 5),
    [recipes]
  );

  const favoriteRecipes = useMemo(() => recipes.filter((r) => r.favorite), [recipes]);

  const value: RecipesContextValue = {
    recipes,
    activeRecipeId,
    activeRecipe,
    recentRecipes,
    favoriteRecipes,
    setActiveRecipeId,
    createRecipe,
    renameRecipe,
    duplicateRecipe,
    deleteRecipe,
    undoDelete,
    pendingDeletion,
    dismissUndo,
    toggleFavorite,
    updateRecipe,
    addIngredient,
    updateIngredient,
    removeIngredient,
    reorderIngredients,
    updateCostItem,
    updatePortions,
    updateSimulationPortions,
    updateSellingPrice,
    importRecipe,
    cloudSync,
  };

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipesStore(): RecipesContextValue {
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error('useRecipesStore must be used within RecipesProvider');
  return ctx;
}
