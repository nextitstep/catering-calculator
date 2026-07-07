import type { IngredientCatalogEntry, Menu, MenuIngredient } from '@/types';

function ingredient(name: string, quantity: number, unit: MenuIngredient['unit']): MenuIngredient {
  return { id: crypto.randomUUID(), name, quantity, unit };
}

const SEED_PRICES: [string, MenuIngredient['unit'], number][] = [
  ['Escalope', 'kg', 900],
  ['Tomate', 'kg', 140],
  ['Poivron', 'kg', 140],
  ['Poivron piquant', 'kg', 160],
  ['Star', 'piece', 160],
  ['Loya', 'piece', 150],
  ['Pomme de terre', 'kg', 120],
  ['Salade', 'piece', 120],
  ['Riz', 'kg', 380],
];

export function createSeedIngredientCatalog(): IngredientCatalogEntry[] {
  const now = new Date().toISOString();
  return SEED_PRICES.map(([name, unit, lastPrice]) => ({ name, unit, lastPrice, updatedAt: now }));
}

export function createSeedMenu(): Menu {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: 'Chicken Escalope',
    description: 'Escalope de poulet grillée, riz et légumes',
    portions: 20,
    ingredients: [
      ingredient('Escalope', 5, 'kg'),
      ingredient('Tomate', 3, 'kg'),
      ingredient('Poivron', 4, 'kg'),
      ingredient('Poivron piquant', 1, 'kg'),
      ingredient('Star', 1, 'piece'),
      ingredient('Loya', 1, 'piece'),
      ingredient('Pomme de terre', 4, 'kg'),
      ingredient('Salade', 3, 'piece'),
      ingredient('Riz', 1, 'kg'),
    ],
    preferredSellPrice: 700,
    favorite: true,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
  };
}
