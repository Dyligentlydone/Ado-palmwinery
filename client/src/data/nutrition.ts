// Per-product nutritional overview, keyed by product slug.
// Vino de Coyol values taken from the physical bottle label (serving = 1 bottle, 355ml).
// Gin/cocktail values are estimates — replace with lab-verified numbers when available.

export interface NutritionFacts {
  servingSizeMl: number;
  caloriesKcal: number;
  carbsG: number;
  sugarG: number;
  proteinG: number;
  fatG: number;
  sodiumMg: number;
  fiberG?: number;
  potassiumMg?: number;
}

const WINE_FACTS: NutritionFacts = {
  servingSizeMl: 355,
  caloriesKcal: 60,
  carbsG: 13,
  sugarG: 5,
  proteinG: 1,
  fatG: 0,
  sodiumMg: 15,
  fiberG: 6,
  potassiumMg: 810,
};

export const PRODUCT_NUTRITION: Record<string, NutritionFacts> = {
  'vino-de-coyol-original': WINE_FACTS,
  'vino-de-coyol-non-alcoholic': WINE_FACTS,
  'vino-de-coyol-pineapple': WINE_FACTS,
  'vino-de-coyol-mango': WINE_FACTS,
  'vino-de-coyol-passion-fruit': WINE_FACTS,
  'el-fuego-de-coyol': {
    servingSizeMl: 45, caloriesKcal: 105, carbsG: 0, sugarG: 0, proteinG: 0, fatG: 0, sodiumMg: 0,
  },
  'pineapple-sunset-cocktail': {
    servingSizeMl: 355, caloriesKcal: 185, carbsG: 22, sugarG: 18, proteinG: 0, fatG: 0, sodiumMg: 20,
  },
  'mango-sunset-cocktail': {
    servingSizeMl: 355, caloriesKcal: 185, carbsG: 22, sugarG: 18, proteinG: 0, fatG: 0, sodiumMg: 20,
  },
  'passion-fruit-sunset-cocktail': {
    servingSizeMl: 355, caloriesKcal: 185, carbsG: 22, sugarG: 18, proteinG: 0, fatG: 0, sodiumMg: 20,
  },
};

// Maps a DB category slug to the Product Knowledge category slug it belongs to
const KNOWLEDGE_CATEGORY_BY_CATEGORY: Record<string, string> = {
  'vino-de-coyol': 'palm-sap-wine',
  'palm-spirits': 'palm-gin',
  'cocktails': 'sunset-cocktails',
};

export function knowledgeSlugForCategory(categorySlug?: string): string {
  return categorySlug ? (KNOWLEDGE_CATEGORY_BY_CATEGORY[categorySlug] || 'palm-sap-wine') : 'palm-sap-wine';
}
