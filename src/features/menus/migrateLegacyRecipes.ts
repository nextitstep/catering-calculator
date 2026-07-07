import type { Menu, MenuIngredient, Unit } from '@/types';

const OLD_KEY = 'catering-calc/recipes';

interface LegacyIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  customUnit?: string;
}

interface LegacyRecipe {
  id: string;
  name: string;
  description?: string;
  portions?: number;
  ingredients?: LegacyIngredient[];
  sellingPrice?: number;
  favorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastOpenedAt?: string;
}

/** One-time migration from the old single-active-recipe data shape to independent Menus. */
export function migrateLegacyRecipesIfNeeded(): Menu[] | null {
  try {
    const raw = localStorage.getItem(OLD_KEY);
    if (!raw) return null;
    const legacy = JSON.parse(raw) as LegacyRecipe[];
    if (!Array.isArray(legacy) || legacy.length === 0) return null;
    const now = new Date().toISOString();
    return legacy.map(
      (r): Menu => ({
        id: r.id ?? crypto.randomUUID(),
        name: r.name ?? 'Untitled',
        description: r.description ?? '',
        portions: r.portions ?? 10,
        ingredients: (r.ingredients ?? []).map(
          (ing): MenuIngredient => ({
            id: ing.id ?? crypto.randomUUID(),
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit as Unit,
            customUnit: ing.customUnit,
          })
        ),
        preferredSellPrice: r.sellingPrice ?? 0,
        favorite: r.favorite ?? false,
        createdAt: r.createdAt ?? now,
        updatedAt: r.updatedAt ?? now,
        lastOpenedAt: r.lastOpenedAt,
      })
    );
  } catch {
    return null;
  }
}
