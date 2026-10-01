// Hardcoded per-product nutritional overview (per the owner's Product Knowledge spec).
// Values are per serving — replace with lab-verified numbers when available.
// Keys are product slugs.

export interface NutritionFacts {
  servingSizeMl: number;
  caloriesKcal: number;
  carbsG: number;
  sugarG: number;
  proteinG: number;
  fatG: number;
  sodiumMg: number;
}

export const PRODUCT_NUTRITION: Record<string, NutritionFacts> = {
  'vino-de-coyol-original': {
    servingSizeMl: 355, caloriesKcal: 120, carbsG: 18, sugarG: 14, proteinG: 1, fatG: 0, sodiumMg: 15,
  },
  'vino-de-coyol-non-alcoholic': {
    servingSizeMl: 355, caloriesKcal: 110, carbsG: 20, sugarG: 16, proteinG: 1, fatG: 0, sodiumMg: 15,
  },
  'vino-de-coyol-pineapple': {
    servingSizeMl: 355, caloriesKcal: 125, carbsG: 19, sugarG: 15, proteinG: 1, fatG: 0, sodiumMg: 15,
  },
  'vino-de-coyol-mango': {
    servingSizeMl: 355, caloriesKcal: 125, carbsG: 19, sugarG: 15, proteinG: 1, fatG: 0, sodiumMg: 15,
  },
  'vino-de-coyol-passion-fruit': {
    servingSizeMl: 355, caloriesKcal: 125, carbsG: 19, sugarG: 15, proteinG: 1, fatG: 0, sodiumMg: 15,
  },
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
