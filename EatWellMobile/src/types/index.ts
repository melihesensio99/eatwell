
export interface CaloriePercent {
  energyKcal100g: number | null;
  fatPercent: number;
  proteinPercent: number;
  carbPercent: number;
}

export interface ProductAnalysis {
  productName: string | null;
  imageFrontUrl: string | null;
  novaGroup: string | null;
  nutritionScoreBeverage: number | null;
  nutritionGrades: string | null;
  additivesTags: string[] | null;
  additiveDescriptions: string[] | null;
  fat: string;
  salt: string;
  saturatedFat: string;

  sugars: string;
  score: number;
  isHealthy: boolean;
  allergenWarning?: AllergenWarning;
}

export interface AllergenWarning {
  hasAllergenWarning: boolean;
  detectedAllergens: string[];
}

export interface FoodCalorieInfo {
  productName: string | null;
  fat100g: number | null;
  proteins100g: number | null;
  carbohydrates100g: number | null;
  sugars100g: number | null;
  saturatedFat100g: number | null;
  salt100g: number | null;
  caloriePercentInfo: CaloriePercent;
}


export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export type RootStackParamList = {
  Home: undefined;
  Analysis: { barcode: string };
  Calorie: { barcode: string; productName?: string };
};
