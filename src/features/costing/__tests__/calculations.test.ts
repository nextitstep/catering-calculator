import { describe, expect, it } from 'vitest';
import type { Ingredient, Recipe } from '@/types';
import {
  computeRecipeMetrics,
  costItemTotal,
  costPerPortion,
  grandTotal,
  ingredientTotal,
  ingredientsTotal,
  marginPercent,
  markupPercent,
  pricingSuggestions,
  profit,
  profitPerPortion,
  revenue,
  scaleFactor,
} from '@/features/costing/calculations';

function makeIngredient(overrides: Partial<Ingredient>): Ingredient {
  return {
    id: crypto.randomUUID(),
    name: 'Test',
    quantity: 1,
    unit: 'kg',
    unitPrice: 0,
    ...overrides,
  };
}

const chickenEscalope: Recipe = {
  id: 'r1',
  name: 'Chicken Escalope',
  description: '',
  portions: 20,
  simulationPortions: 20,
  ingredients: [
    makeIngredient({ name: 'Escalope', quantity: 5, unit: 'kg', unitPrice: 900 }),
    makeIngredient({ name: 'Tomate', quantity: 3, unit: 'kg', unitPrice: 140 }),
    makeIngredient({ name: 'Poivron', quantity: 4, unit: 'kg', unitPrice: 140 }),
    makeIngredient({ name: 'Poivron piquant', quantity: 1, unit: 'kg', unitPrice: 160 }),
    makeIngredient({ name: 'Star', quantity: 1, unit: 'piece', unitPrice: 160 }),
    makeIngredient({ name: 'Loya', quantity: 1, unit: 'piece', unitPrice: 150 }),
    makeIngredient({ name: 'Pomme de terre', quantity: 4, unit: 'kg', unitPrice: 120 }),
    makeIngredient({ name: 'Salade', quantity: 3, unit: 'piece', unitPrice: 120 }),
    makeIngredient({ name: 'Riz', quantity: 1, unit: 'kg', unitPrice: 380 }),
  ],
  packaging: { mode: 'perPortion', value: 85 },
  transport: { mode: 'fixed', value: 0 },
  labor: { mode: 'fixed', value: 0 },
  utilities: { mode: 'fixed', value: 0 },
  miscellaneous: { mode: 'fixed', value: 0 },
  sellingPrice: 700,
  favorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ingredientTotal', () => {
  it('multiplies quantity by unit price', () => {
    expect(ingredientTotal(makeIngredient({ quantity: 5, unitPrice: 900 }))).toBe(4500);
  });
});

describe('ingredientsTotal', () => {
  it('matches the Chicken Escalope example (7170 DA)', () => {
    expect(ingredientsTotal(chickenEscalope.ingredients)).toBe(7170);
  });
});

describe('costItemTotal', () => {
  it('returns fixed value regardless of portions', () => {
    expect(costItemTotal({ mode: 'fixed', value: 500 }, 20)).toBe(500);
  });
  it('multiplies per-portion value by portions (85 x 20 = 1700)', () => {
    expect(costItemTotal({ mode: 'perPortion', value: 85 }, 20)).toBe(1700);
  });
});

describe('grandTotal / costPerPortion', () => {
  it('matches the Chicken Escalope example (8870 total, 443.50 per portion)', () => {
    expect(grandTotal(chickenEscalope)).toBe(8870);
    expect(costPerPortion(chickenEscalope)).toBe(443.5);
  });
});

describe('revenue / profit', () => {
  it('matches the Chicken Escalope example (14000 revenue, 5130 profit)', () => {
    const rev = revenue(chickenEscalope.sellingPrice, chickenEscalope.portions);
    expect(rev).toBe(14000);
    expect(profit(rev, grandTotal(chickenEscalope))).toBe(5130);
  });

  it('profit per portion matches example (256.50)', () => {
    expect(
      profitPerPortion(chickenEscalope.sellingPrice, costPerPortion(chickenEscalope))
    ).toBe(256.5);
  });
});

describe('margin / markup', () => {
  it('matches the Chicken Escalope example (36.64% margin, 57.84% markup)', () => {
    const rev = 14000;
    const total = 8870;
    const prof = 5130;
    expect(marginPercent(prof, rev)).toBeCloseTo(36.64, 1);
    expect(markupPercent(prof, total)).toBeCloseTo(57.84, 1);
  });
});

describe('computeRecipeMetrics', () => {
  it('produces a full consistent metrics object', () => {
    const metrics = computeRecipeMetrics(chickenEscalope);
    expect(metrics.grandTotal).toBe(8870);
    expect(metrics.costPerPortion).toBe(443.5);
    expect(metrics.revenue).toBe(14000);
    expect(metrics.profit).toBe(5130);
    expect(metrics.profitPerPortion).toBe(256.5);
    expect(metrics.breakdown.ingredients).toBe(7170);
    expect(metrics.breakdown.packaging).toBe(1700);
  });
});

describe('pricingSuggestions', () => {
  it('break-even suggestion equals cost per portion', () => {
    const suggestions = pricingSuggestions(chickenEscalope);
    const breakEven = suggestions.find((s) => s.label === 'Break Even')!;
    expect(breakEven.sellingPrice).toBe(443.5);
    expect(breakEven.profitPerPortion).toBe(0);
  });

  it('generates all seven suggestion tiers', () => {
    expect(pricingSuggestions(chickenEscalope)).toHaveLength(7);
  });
});

describe('scenario portions scaling', () => {
  it('scale factor is 1 when scenario portions equal the master portions', () => {
    expect(scaleFactor(chickenEscalope)).toBe(1);
  });

  it('doubling scenario portions doubles ingredient cost and keeps cost per portion stable', () => {
    const doubled: Recipe = { ...chickenEscalope, simulationPortions: 40 };
    expect(scaleFactor(doubled)).toBe(2);
    const metrics = computeRecipeMetrics(doubled);
    // Ingredients scale 2x (7170 -> 14340), packaging is per-portion so also scales (85*40=3400)
    expect(metrics.breakdown.ingredients).toBe(14340);
    expect(metrics.breakdown.packaging).toBe(3400);
    expect(metrics.grandTotal).toBe(17740);
    // Cost per portion stays the same as the un-scaled scenario since everything scales linearly
    expect(metrics.costPerPortion).toBe(443.5);
  });

  it('fixed-mode cost items do not scale with scenario portions', () => {
    const withFixedLabor: Recipe = {
      ...chickenEscalope,
      labor: { mode: 'fixed', value: 500 },
      simulationPortions: 40,
    };
    expect(computeRecipeMetrics(withFixedLabor).breakdown.labor).toBe(500);
  });
});
