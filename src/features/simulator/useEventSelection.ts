import { useCallback } from 'react';
import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';

export interface EventEntry {
  recipeId: string;
  portions: number;
}

const STORAGE_KEY = 'catering-calc/event-selection';

export function useEventSelection() {
  const [entries, setEntries] = useLocalStorageState<EventEntry[]>(STORAGE_KEY, []);

  const isIncluded = useCallback(
    (recipeId: string) => entries.some((e) => e.recipeId === recipeId),
    [entries]
  );

  const toggleRecipe = useCallback(
    (recipeId: string, defaultPortions: number) => {
      setEntries((prev) => {
        if (prev.some((e) => e.recipeId === recipeId)) {
          return prev.filter((e) => e.recipeId !== recipeId);
        }
        return [...prev, { recipeId, portions: defaultPortions }];
      });
    },
    [setEntries]
  );

  const setPortions = useCallback(
    (recipeId: string, portions: number) => {
      setEntries((prev) =>
        prev.map((e) => (e.recipeId === recipeId ? { ...e, portions: Math.max(0, portions) } : e))
      );
    },
    [setEntries]
  );

  const clear = useCallback(() => setEntries([]), [setEntries]);

  return { entries, isIncluded, toggleRecipe, setPortions, clear };
}
