import type { CostItem, Ingredient, Recipe } from '@/types';

/** Ratio between the scenario portions being costed and the recipe's reference portions. */
export function scaleFactor(recipe: Recipe): number {
  if (!recipe.portions) return 1;
  return recipe.simulationPortions / recipe.portions;
}

export function ingredientTotal(ingredient: Ingredient, scale = 1): number {
  return round2(ingredient.quantity * scale * ingredient.unitPrice);
}

export function ingredientsTotal(ingredients: Ingredient[], scale = 1): number {
  return round2(ingredients.reduce((sum, i) => sum + ingredientTotal(i, scale), 0));
}

export function costItemTotal(item: CostItem, portions: number): number {
  if (item.mode === 'perPortion') {
    return round2(item.value * Math.max(portions, 0));
  }
  return round2(item.value);
}

export interface CostBreakdown {
  ingredients: number;
  packaging: number;
  transport: number;
  labor: number;
  utilities: number;
  miscellaneous: number;
}

export function costBreakdown(recipe: Recipe): CostBreakdown {
  const scale = scaleFactor(recipe);
  const portions = recipe.simulationPortions;
  return {
    ingredients: ingredientsTotal(recipe.ingredients, scale),
    packaging: costItemTotal(recipe.packaging, portions),
    transport: costItemTotal(recipe.transport, portions),
    labor: costItemTotal(recipe.labor, portions),
    utilities: costItemTotal(recipe.utilities, portions),
    miscellaneous: costItemTotal(recipe.miscellaneous, portions),
  };
}

export function grandTotal(recipe: Recipe): number {
  const b = costBreakdown(recipe);
  return round2(
    b.ingredients + b.packaging + b.transport + b.labor + b.utilities + b.miscellaneous
  );
}

export function costPerPortion(recipe: Recipe): number {
  const portions = recipe.simulationPortions || 1;
  return round2(grandTotal(recipe) / portions);
}

export function revenue(sellingPrice: number, portions: number): number {
  return round2(sellingPrice * portions);
}

export function profit(rev: number, totalCost: number): number {
  return round2(rev - totalCost);
}

export function profitPerPortion(sellingPrice: number, perPortionCost: number): number {
  return round2(sellingPrice - perPortionCost);
}

export function marginPercent(profitValue: number, rev: number): number {
  if (rev === 0) return 0;
  return round2((profitValue / rev) * 100);
}

export function markupPercent(profitValue: number, totalCost: number): number {
  if (totalCost === 0) return 0;
  return round2((profitValue / totalCost) * 100);
}

export interface RecipeMetrics {
  breakdown: CostBreakdown;
  grandTotal: number;
  costPerPortion: number;
  revenue: number;
  profit: number;
  profitPerPortion: number;
  margin: number;
  markup: number;
}

export function computeRecipeMetrics(recipe: Recipe): RecipeMetrics {
  const breakdown = costBreakdown(recipe);
  const total = grandTotal(recipe);
  const perPortion = costPerPortion(recipe);
  const rev = revenue(recipe.sellingPrice, recipe.simulationPortions);
  const prof = profit(rev, total);
  const profPerPortion = profitPerPortion(recipe.sellingPrice, perPortion);
  return {
    breakdown,
    grandTotal: total,
    costPerPortion: perPortion,
    revenue: rev,
    profit: prof,
    profitPerPortion: profPerPortion,
    margin: marginPercent(prof, rev),
    markup: markupPercent(prof, total),
  };
}

export interface PricingSuggestion {
  label: string;
  multiplier: number;
  sellingPrice: number;
  profitPerPortion: number;
  margin: number;
  markup: number;
}

const SUGGESTION_MULTIPLIERS: { label: string; multiplier: number }[] = [
  { label: 'Break Even', multiplier: 1 },
  { label: '1.10x Cost', multiplier: 1.1 },
  { label: '1.25x Cost', multiplier: 1.25 },
  { label: '1.5x Cost', multiplier: 1.5 },
  { label: '2x Cost', multiplier: 2 },
  { label: '2.5x Cost', multiplier: 2.5 },
  { label: '3x Cost', multiplier: 3 },
];

export const TARGET_MULTIPLIER = 3;

export function pricingSuggestions(recipe: Recipe): PricingSuggestion[] {
  const perPortion = costPerPortion(recipe);
  return SUGGESTION_MULTIPLIERS.map(({ label, multiplier }) => {
    const sellingPrice = round2(perPortion * multiplier);
    const rev = revenue(sellingPrice, recipe.simulationPortions);
    const total = grandTotal(recipe);
    const prof = profit(rev, total);
    return {
      label,
      multiplier,
      sellingPrice,
      profitPerPortion: profitPerPortion(sellingPrice, perPortion),
      margin: marginPercent(prof, rev),
      markup: markupPercent(prof, total),
    };
  });
}

export interface ProfitSimPoint {
  sellingPrice: number;
  profit: number;
  revenue: number;
}

export function profitSimulationSeries(
  recipe: Recipe,
  steps = 20,
  maxMultiplier = 3
): ProfitSimPoint[] {
  const perPortion = costPerPortion(recipe) || 1;
  const total = grandTotal(recipe);
  const maxPrice = perPortion * maxMultiplier;
  const points: ProfitSimPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const price = round2((maxPrice / steps) * i);
    const rev = revenue(price, recipe.simulationPortions);
    points.push({
      sellingPrice: price,
      profit: profit(rev, total),
      revenue: rev,
    });
  }
  return points;
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
