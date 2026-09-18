import { apiClient } from '../../../api/client';
export interface WeeklyNutritionSummaryDto { readonly fromDate: string; readonly toDate: string; readonly days: readonly { date: string; calories: number; targetCalories?: number | null; proteinGrams: number; carbohydratesGrams: number; fatGrams: number; waterMilliliters: number }[]; }
export const analyticsService = { getWeeklySummary: async (weekStart: string) => (await apiClient.get<WeeklyNutritionSummaryDto>('/api/analytics/weekly-summary', { params: { weekStart } })).data };
