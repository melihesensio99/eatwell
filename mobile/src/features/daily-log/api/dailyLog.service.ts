import { apiClient } from '../../../api/client';
import { DailySummaryDto } from '../../../types/api';
export interface AddDailyLogItemRequest { readonly foodExternalId: string; readonly foodName: string; readonly quantityGrams: number; readonly mealType: string; readonly logDate: string; readonly caloriesPer100Grams?: number | null; readonly proteinPer100Grams?: number | null; readonly carbohydratesPer100Grams?: number | null; readonly fatPer100Grams?: number | null; readonly brand?: string | null; readonly barcode?: string | null; }
export interface DailyLogItemDto { readonly id: string; readonly foodExternalId: string; readonly foodName: string; readonly brand?: string | null; readonly barcode?: string | null; readonly quantityGrams: number; readonly mealType: string; readonly calories?: number | null; readonly proteinGrams?: number | null; readonly carbohydratesGrams?: number | null; readonly fatGrams?: number | null; }
export interface DailyLogHistoryDto { readonly id: string; readonly logDate: string; readonly waterConsumedMilliliters: number; readonly totalCalories: number; readonly totalProteinGrams: number; readonly totalCarbohydratesGrams: number; readonly totalFatGrams: number; readonly items: DailyLogItemDto[]; }
const toApiMealType = (mealType: string) => ({ 'Kahvaltı': 'breakfast', 'Öğle': 'lunch', 'Akşam': 'dinner', 'Ara Öğün': 'snack' }[mealType] ?? mealType);
const fromApiMealType = (mealType: string) => ({ breakfast: 'Kahvaltı', lunch: 'Öğle', dinner: 'Akşam', snack: 'Ara Öğün' }[mealType] ?? mealType);
const mapLog = (log: DailyLogHistoryDto): DailyLogHistoryDto => ({ ...log, items: log.items.map((item) => ({ ...item, mealType: fromApiMealType(item.mealType) })) });
export const dailyLogService = {
  getSummary: async (date: string) => (await apiClient.get<DailySummaryDto>('/api/daily-logs/summary', { params: { date } })).data,
  addItem: async (request: AddDailyLogItemRequest) => (await apiClient.post<{ itemId: string }>('/api/daily-logs/items', { ...request, mealType: toApiMealType(request.mealType) })).data,
  addWater: async (milliliters: number, logDate: string) => apiClient.post('/api/daily-logs/water', { milliliters, logDate }),
  getHistory: async (fromDate: string, toDate: string) => (await apiClient.get<DailyLogHistoryDto[]>('/api/daily-logs/history', { params: { fromDate, toDate } })).data.map(mapLog),
  get: async (date: string) => mapLog((await apiClient.get<DailyLogHistoryDto>('/api/daily-logs', { params: { date } })).data),
  updateItem: async (itemId: string, request: { quantityGrams: number; caloriesPer100Grams?: number | null; proteinPer100Grams?: number | null; carbohydratesPer100Grams?: number | null; fatPer100Grams?: number | null }) => apiClient.put(`/api/daily-logs/items/${itemId}`, { itemId, ...request }),
  deleteItem: async (itemId: string) => apiClient.delete(`/api/daily-logs/items/${itemId}`),
};
