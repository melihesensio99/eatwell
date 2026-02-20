export interface AddConsumptionRequest {
  deviceId: string;
  code: string;
  amount: number;
  date?: string;
}

export interface ConsumedItemDto {
  code: string;
  productName?: string;
  amount: number;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
}

export interface DailySummaryDto {
  date: string;
  totalCalorie: number;
  totalFat: number;
  totalProtein: number;
  totalCarb: number;
  consumedItems: ConsumedItemDto[];
  calorieGoal?: number | null;
  calorieRemaining?: number | null;
  calorieGoalPercentage?: number | null;
}

export interface CalorieGoalResponse {
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: number;
  goalType: number;
  activityLevelLabel: string;
  goalTypeLabel: string;
}

export interface SetCalorieGoalRequest {
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: number;
  goalType: number;
}
