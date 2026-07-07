import type { Ingredient, Recipe } from '@/types';

function ingredient(
  name: string,
  quantity: number,
  unit: Ingredient['unit'],
  unitPrice: number
): Ingredient {
  return { id: crypto.randomUUID(), name, quantity, unit, unitPrice };
}

export function createSeedRecipe(): Recipe {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: 'Chicken Escalope',
    description: 'Escalope de poulet grillée, riz et légumes',
    portions: 20,
    simulationPortions: 20,
    ingredients: [
      ingredient('Escalope', 5, 'kg', 900),
      ingredient('Tomate', 3, 'kg', 140),
      ingredient('Poivron', 4, 'kg', 140),
      ingredient('Poivron piquant', 1, 'kg', 160),
      ingredient('Star', 1, 'piece', 160),
      ingredient('Loya', 1, 'piece', 150),
      ingredient('Pomme de terre', 4, 'kg', 120),
      ingredient('Salade', 3, 'piece', 120),
      ingredient('Riz', 1, 'kg', 380),
    ],
    packaging: { mode: 'perPortion', value: 85 },
    transport: { mode: 'fixed', value: 0 },
    labor: { mode: 'fixed', value: 0 },
    utilities: { mode: 'fixed', value: 0 },
    miscellaneous: { mode: 'fixed', value: 0 },
    sellingPrice: 700,
    favorite: true,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
  };
}
