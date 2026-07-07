import type { CostItem, Menu, Unit } from '@/types';

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function costItemTotal(item: CostItem, portions: number): number {
  if (item.mode === 'perPortion') {
    return round2(item.value * Math.max(portions, 0));
  }
  return round2(item.value);
}

export function marginPercent(profitValue: number, rev: number): number {
  if (rev === 0) return 0;
  return round2((profitValue / rev) * 100);
}

export function markupPercent(profitValue: number, totalCost: number): number {
  if (totalCost === 0) return 0;
  return round2((profitValue / totalCost) * 100);
}

export const TARGET_MULTIPLIER = 3;

/** How a menu's ingredient quantities scale when producing `quantity` portions instead of its reference batch size. */
export function scaleFactorFor(menu: Menu, quantity: number): number {
  if (!menu.portions) return 1;
  return quantity / menu.portions;
}

export type PriceLookup = (ingredientName: string, unit: Unit) => number;

/** Cost of a single menu's ingredients when producing `quantity` portions, using prices from the simulator's price sheet. */
export function menuIngredientsCost(menu: Menu, quantity: number, priceLookup: PriceLookup): number {
  const scale = scaleFactorFor(menu, quantity);
  return round2(
    menu.ingredients.reduce((sum, ing) => sum + ing.quantity * scale * priceLookup(ing.name, ing.unit), 0)
  );
}

export interface OtherCosts {
  packaging: CostItem;
  transport: CostItem;
  labor: CostItem;
  utilities: CostItem;
  miscellaneous: CostItem;
}

export const DEFAULT_OTHER_COSTS: OtherCosts = {
  packaging: { mode: 'fixed', value: 0 },
  transport: { mode: 'fixed', value: 1500 },
  labor: { mode: 'fixed', value: 2000 },
  utilities: { mode: 'fixed', value: 0 },
  miscellaneous: { mode: 'fixed', value: 0 },
};

export interface MenuSelection {
  menu: Menu;
  quantity: number;
  sellPrice: number;
}

export interface CostBreakdown {
  ingredients: number;
  packaging: number;
  transport: number;
  labor: number;
  utilities: number;
  miscellaneous: number;
}

export interface EventTotals {
  totalPortions: number;
  breakdown: CostBreakdown;
  totalCost: number;
  costPerPortion: number;
  totalRevenue: number;
  totalProfit: number;
  margin: number;
  markup: number;
}

/**
 * Combines one or more menu selections (each with its own quantity and estimated sell price) plus
 * a single shared set of overhead costs into one simulated total - this is the only place cost
 * numbers exist; menus themselves carry no pricing data.
 */
export function computeEventTotals(
  selections: MenuSelection[],
  otherCosts: OtherCosts,
  priceLookup: PriceLookup
): EventTotals {
  const totalPortions = selections.reduce((sum, s) => sum + Math.max(s.quantity, 0), 0);
  const ingredientsCost = round2(
    selections.reduce((sum, s) => sum + menuIngredientsCost(s.menu, s.quantity, priceLookup), 0)
  );
  const breakdown: CostBreakdown = {
    ingredients: ingredientsCost,
    packaging: costItemTotal(otherCosts.packaging, totalPortions),
    transport: costItemTotal(otherCosts.transport, totalPortions),
    labor: costItemTotal(otherCosts.labor, totalPortions),
    utilities: costItemTotal(otherCosts.utilities, totalPortions),
    miscellaneous: costItemTotal(otherCosts.miscellaneous, totalPortions),
  };
  const totalCost = round2(
    breakdown.ingredients +
      breakdown.packaging +
      breakdown.transport +
      breakdown.labor +
      breakdown.utilities +
      breakdown.miscellaneous
  );
  const totalRevenue = round2(
    selections.reduce((sum, s) => sum + Math.max(s.quantity, 0) * s.sellPrice, 0)
  );
  const totalProfit = round2(totalRevenue - totalCost);
  const costPerPortion = totalPortions > 0 ? round2(totalCost / totalPortions) : 0;

  return {
    totalPortions,
    breakdown,
    totalCost,
    costPerPortion,
    totalRevenue,
    totalProfit,
    margin: marginPercent(totalProfit, totalRevenue),
    markup: markupPercent(totalProfit, totalCost),
  };
}
