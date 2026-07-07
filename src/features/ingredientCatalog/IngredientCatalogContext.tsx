import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { IngredientCatalogEntry, Unit } from '@/types';
import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';
import { createSeedIngredientCatalog } from '@/features/menus/seedData';
import { useSharedSync } from '@/features/sync/useSharedSync';

const STORAGE_KEY = 'catering-calc/ingredient-catalog';
const SYNC_PATH = 'shared/ingredientCatalog';

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

interface IngredientCatalogContextValue {
  catalog: IngredientCatalogEntry[];
  /** Remembers an ingredient name/unit (and optionally its latest price) for future autocomplete. */
  remember: (name: string, unit: Unit, customUnit?: string, price?: number) => void;
  /** Removes an ingredient from the catalog entirely. */
  removeEntry: (name: string) => void;
  /** Suggestions matching a partial name, most recently updated first. */
  suggestions: (query: string) => IngredientCatalogEntry[];
  /** Last known price for an ingredient, 0 if never recorded. */
  getPrice: (name: string) => number;
}

const IngredientCatalogContext = createContext<IngredientCatalogContextValue | null>(null);

export function IngredientCatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useLocalStorageState<IngredientCatalogEntry[]>(
    STORAGE_KEY,
    createSeedIngredientCatalog
  );
  useSharedSync(SYNC_PATH, catalog, setCatalog);

  const remember = useCallback(
    (name: string, unit: Unit, customUnit?: string, price?: number) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const key = normalize(trimmed);
      setCatalog((prev) => {
        const existing = prev.find((e) => normalize(e.name) === key);
        const now = new Date().toISOString();
        if (existing) {
          return prev.map((e) =>
            normalize(e.name) === key
              ? {
                  ...e,
                  name: trimmed,
                  unit,
                  customUnit,
                  lastPrice: price ?? e.lastPrice,
                  updatedAt: now,
                }
              : e
          );
        }
        return [...prev, { name: trimmed, unit, customUnit, lastPrice: price ?? 0, updatedAt: now }];
      });
    },
    [setCatalog]
  );

  const removeEntry = useCallback(
    (name: string) => {
      const key = normalize(name);
      setCatalog((prev) => prev.filter((e) => normalize(e.name) !== key));
    },
    [setCatalog]
  );

  const suggestions = useCallback(
    (query: string) => {
      const q = normalize(query);
      const matches = q ? catalog.filter((e) => normalize(e.name).includes(q)) : catalog;
      return [...matches].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8);
    },
    [catalog]
  );

  const getPrice = useCallback(
    (name: string) => {
      const key = normalize(name);
      return catalog.find((e) => normalize(e.name) === key)?.lastPrice ?? 0;
    },
    [catalog]
  );

  const value = useMemo<IngredientCatalogContextValue>(
    () => ({ catalog, remember, removeEntry, suggestions, getPrice }),
    [catalog, remember, removeEntry, suggestions, getPrice]
  );

  return (
    <IngredientCatalogContext.Provider value={value}>{children}</IngredientCatalogContext.Provider>
  );
}

export function useIngredientCatalog(): IngredientCatalogContextValue {
  const ctx = useContext(IngredientCatalogContext);
  if (!ctx) throw new Error('useIngredientCatalog must be used within IngredientCatalogProvider');
  return ctx;
}
