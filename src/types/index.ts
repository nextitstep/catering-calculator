export type Unit = 'kg' | 'g' | 'L' | 'ml' | 'piece' | 'box' | 'bag' | 'custom';

export const UNIT_OPTIONS: Unit[] = ['kg', 'g', 'L', 'ml', 'piece', 'box', 'bag', 'custom'];

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  customUnit?: string;
  unitPrice: number;
  supplier?: string;
  category?: string;
  notes?: string;
}

export type CostMode = 'fixed' | 'perPortion';

export interface CostItem {
  mode: CostMode;
  value: number;
}

export const DEFAULT_COST_ITEM: CostItem = { mode: 'fixed', value: 0 };

export interface Recipe {
  id: string;
  name: string;
  description: string;
  /** Reference batch size the ingredient quantities below are written for. */
  portions: number;
  /** Portions to actually produce in the current costing scenario; scales ingredient quantities. */
  simulationPortions: number;
  ingredients: Ingredient[];
  packaging: CostItem;
  transport: CostItem;
  labor: CostItem;
  utilities: CostItem;
  miscellaneous: CostItem;
  sellingPrice: number;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
}

export type Language = 'en' | 'fr' | 'ar';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  language: Language;
  theme: ThemeMode;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'system',
};
