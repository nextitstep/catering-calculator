import { DEFAULT_OTHER_COSTS, type OtherCosts } from '@/features/costing/calculations';
import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';
import type { CostItem } from '@/types';

const STORAGE_KEY = 'catering-calc/simulator-other-costs';

export type OtherCostKey = keyof OtherCosts;

export function useSimulatorCosts() {
  const [otherCosts, setOtherCosts] = useLocalStorageState<OtherCosts>(
    STORAGE_KEY,
    DEFAULT_OTHER_COSTS
  );

  const updateCost = (key: OtherCostKey, item: CostItem) => {
    setOtherCosts((prev) => ({ ...prev, [key]: item }));
  };

  return { otherCosts, updateCost };
}
