import { describe, expect, it } from 'vitest';
import type { Menu, MenuIngredient } from '@/types';
import {
  computeEventTotals,
  costItemTotal,
  marginPercent,
  markupPercent,
  menuIngredientsCost,
  scaleFactorFor,
  TARGET_MULTIPLIER,
  type OtherCosts,
  type PriceLookup,
} from '@/features/costing/calculations';

function makeIngredient(overrides: Partial<MenuIngredient>): MenuIngredient {
  return {
    id: crypto.randomUUID(),
    name: 'Test',
    quantity: 1,
    unit: 'kg',
    ...overrides,
  };
}

const chickenEscalope: Menu = {
  id: 'm1',
  name: 'Chicken Escalope',
  description: '',
  portions: 20,
  ingredients: [
    makeIngredient({ name: 'Escalope', quantity: 5, unit: 'kg' }),
    makeIngredient({ name: 'Tomate', quantity: 3, unit: 'kg' }),
    makeIngredient({ name: 'Poivron', quantity: 4, unit: 'kg' }),
    makeIngredient({ name: 'Poivron piquant', quantity: 1, unit: 'kg' }),
    makeIngredient({ name: 'Star', quantity: 1, unit: 'piece' }),
    makeIngredient({ name: 'Loya', quantity: 1, unit: 'piece' }),
    makeIngredient({ name: 'Pomme de terre', quantity: 4, unit: 'kg' }),
    makeIngredient({ name: 'Salade', quantity: 3, unit: 'piece' }),
    makeIngredient({ name: 'Riz', quantity: 1, unit: 'kg' }),
  ],
  preferredSellPrice: 700,
  favorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const PRICES: Record<string, number> = {
  Escalope: 900,
  Tomate: 140,
  Poivron: 140,
  'Poivron piquant': 160,
  Star: 160,
  Loya: 150,
  'Pomme de terre': 120,
  Salade: 120,
  Riz: 380,
};

const priceLookup: PriceLookup = (name) => PRICES[name] ?? 0;

const noOtherCosts: OtherCosts = {
  packaging: { mode: 'fixed', value: 0 },
  transport: { mode: 'fixed', value: 0 },
  labor: { mode: 'fixed', value: 0 },
  utilities: { mode: 'fixed', value: 0 },
  miscellaneous: { mode: 'fixed', value: 0 },
};

describe('costItemTotal', () => {
  it('returns fixed value regardless of portions', () => {
    expect(costItemTotal({ mode: 'fixed', value: 500 }, 20)).toBe(500);
  });
  it('multiplies per-portion value by portions (85 x 20 = 1700)', () => {
    expect(costItemTotal({ mode: 'perPortion', value: 85 }, 20)).toBe(1700);
  });
});

describe('scaleFactorFor', () => {
  it('is 1 when producing exactly the reference portions', () => {
    expect(scaleFactorFor(chickenEscalope, 20)).toBe(1);
  });
  it('doubles when producing twice the reference portions', () => {
    expect(scaleFactorFor(chickenEscalope, 40)).toBe(2);
  });
});

describe('menuIngredientsCost', () => {
  it('matches the Chicken Escalope example at reference portions (7170 DA)', () => {
    expect(menuIngredientsCost(chickenEscalope, 20, priceLookup)).toBe(7170);
  });
  it('scales linearly with quantity', () => {
    expect(menuIngredientsCost(chickenEscalope, 40, priceLookup)).toBe(14340);
  });
  it('returns 0 for unknown ingredient prices', () => {
    const unknownPriceLookup: PriceLookup = () => 0;
    expect(menuIngredientsCost(chickenEscalope, 20, unknownPriceLookup)).toBe(0);
  });
});

describe('margin / markup', () => {
  it('matches the Chicken Escalope worked example (36.64% margin, 57.84% markup)', () => {
    expect(marginPercent(5130, 14000)).toBeCloseTo(36.64, 1);
    expect(markupPercent(5130, 8870)).toBeCloseTo(57.84, 1);
  });
});

describe('computeEventTotals - single menu', () => {
  it('matches the Chicken Escalope worked example end-to-end', () => {
    const totals = computeEventTotals(
      [{ menu: chickenEscalope, quantity: 20, sellPrice: 700 }],
      { ...noOtherCosts, packaging: { mode: 'perPortion', value: 85 } },
      priceLookup
    );
    expect(totals.totalPortions).toBe(20);
    expect(totals.breakdown.ingredients).toBe(7170);
    expect(totals.breakdown.packaging).toBe(1700);
    expect(totals.totalCost).toBe(8870);
    expect(totals.costPerPortion).toBe(443.5);
    expect(totals.totalRevenue).toBe(14000);
    expect(totals.totalProfit).toBe(5130);
    expect(totals.margin).toBeCloseTo(36.64, 1);
    expect(totals.markup).toBeCloseTo(57.84, 1);
  });
});

describe('computeEventTotals - multiple menus (event)', () => {
  const secondMenu: Menu = {
    ...chickenEscalope,
    id: 'm2',
    name: 'Side Salad',
    portions: 10,
    ingredients: [makeIngredient({ name: 'Lettuce', quantity: 2, unit: 'kg' })],
    preferredSellPrice: 200,
  };
  const twoMenuLookup: PriceLookup = (name) => (name === 'Lettuce' ? 100 : (PRICES[name] ?? 0));

  it('sums cost and revenue across all selected menus', () => {
    const totals = computeEventTotals(
      [
        { menu: chickenEscalope, quantity: 20, sellPrice: 700 },
        { menu: secondMenu, quantity: 10, sellPrice: 200 },
      ],
      noOtherCosts,
      twoMenuLookup
    );
    // second menu: 2kg * (10/10 scale) * 100 = 200
    expect(totals.breakdown.ingredients).toBe(7170 + 200);
    expect(totals.totalPortions).toBe(30);
    expect(totals.totalRevenue).toBe(20 * 700 + 10 * 200);
  });

  it('applies shared other costs once across the combined portions, not per menu', () => {
    const totals = computeEventTotals(
      [
        { menu: chickenEscalope, quantity: 20, sellPrice: 700 },
        { menu: secondMenu, quantity: 10, sellPrice: 200 },
      ],
      { ...noOtherCosts, transport: { mode: 'fixed', value: 1500 } },
      twoMenuLookup
    );
    expect(totals.breakdown.transport).toBe(1500);
  });
});

describe('TARGET_MULTIPLIER', () => {
  it('is 3x, matching the business break-even-to-target policy', () => {
    expect(TARGET_MULTIPLIER).toBe(3);
  });
});
