export type Unit = 'kg' | 'g' | 'L' | 'ml' | 'piece' | 'box' | 'bag' | 'custom';

export const UNIT_OPTIONS: Unit[] = ['kg', 'g', 'L', 'ml', 'piece', 'box', 'bag', 'custom'];

/** An ingredient line on a menu - just what's in it and how much, no price. */
export interface MenuIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  customUnit?: string;
}

export type CostMode = 'fixed' | 'perPortion';

export interface CostItem {
  mode: CostMode;
  value: number;
}

export const DEFAULT_COST_ITEM: CostItem = { mode: 'fixed', value: 0 };

/**
 * A menu is served independently of any simulation - it only records what's in it (ingredients,
 * proportions) and its preferred selling price. Costing (ingredient prices, other overhead costs)
 * is entirely the Simulator's concern and is never stored on the menu.
 */
export interface Menu {
  id: string;
  name: string;
  description: string;
  /** Reference batch size the ingredient quantities are written for. */
  portions: number;
  ingredients: MenuIngredient[];
  preferredSellPrice: number;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
}

/** A remembered ingredient definition, used for autocomplete and default pricing in the Simulator. */
export interface IngredientCatalogEntry {
  name: string;
  unit: Unit;
  customUnit?: string;
  lastPrice: number;
  updatedAt: string;
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
