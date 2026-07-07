import { useCallback } from 'react';
import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';

export interface SimulationEntry {
  menuId: string;
  quantity: number;
}

const STORAGE_KEY = 'catering-calc/simulation-selection';

export function useSimulationSelection() {
  const [entries, setEntries] = useLocalStorageState<SimulationEntry[]>(STORAGE_KEY, []);

  const isIncluded = useCallback(
    (menuId: string) => entries.some((e) => e.menuId === menuId),
    [entries]
  );

  const toggleMenu = useCallback(
    (menuId: string, defaultQuantity: number) => {
      setEntries((prev) => {
        if (prev.some((e) => e.menuId === menuId)) {
          return prev.filter((e) => e.menuId !== menuId);
        }
        return [...prev, { menuId, quantity: defaultQuantity }];
      });
    },
    [setEntries]
  );

  const setQuantity = useCallback(
    (menuId: string, quantity: number) => {
      setEntries((prev) =>
        prev.map((e) => (e.menuId === menuId ? { ...e, quantity: Math.max(0, quantity) } : e))
      );
    },
    [setEntries]
  );

  const clear = useCallback(() => setEntries([]), [setEntries]);

  return { entries, isIncluded, toggleMenu, setQuantity, clear };
}
