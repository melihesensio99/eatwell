import { apiClient } from '../../../api/client';
import { FoodDetailsDto, FoodSearchResultDto } from '../../../types/api';

export interface FoodImageAnalysisRequest { readonly imageBase64: string; readonly mimeType: string; }
export interface FavoriteFoodRequest { readonly foodExternalId: string; readonly foodName: string; readonly brand?: string | null; readonly barcode?: string | null; readonly caloriesPer100Grams?: number | null; readonly proteinPer100Grams?: number | null; readonly carbohydratesPer100Grams?: number | null; readonly fatPer100Grams?: number | null; readonly imageUrl?: string | null; }
export interface SavedFoodDto extends FavoriteFoodRequest { readonly foodExternalId: string; readonly foodName: string; }
export interface FoodImageAnalysisDto { readonly productName: string; readonly analysis: string; readonly healthAdvice: string[]; readonly estimatedPortionGrams?: number | null; readonly caloriesPer100Grams?: number | null; readonly proteinPer100Grams?: number | null; readonly carbohydratesPer100Grams?: number | null; readonly fatPer100Grams?: number | null; readonly sugarsPer100Grams?: number | null; readonly saturatedFatPer100Grams?: number | null; readonly saltPer100Grams?: number | null; readonly detectedComponents: string[]; readonly allergens: string[]; }

export const foodsService = {
  search: async (query: string) => (await apiClient.get<FoodSearchResultDto[]>('/api/foods/search', { params: { query } })).data,
  getByBarcode: async (barcode: string) => (await apiClient.get<FoodDetailsDto>(`/api/foods/barcode/${encodeURIComponent(barcode)}`)).data,
  analyzeImage: async (request: FoodImageAnalysisRequest) => (await apiClient.post<FoodImageAnalysisDto>('/api/foods/analyze-image', request)).data,
  getFavorites: async () => (await apiClient.get<SavedFoodDto[]>('/api/foods/favorites')).data,
  getRecent: async () => (await apiClient.get<SavedFoodDto[]>('/api/foods/recent')).data,
  addFavorite: async (request: FavoriteFoodRequest) => apiClient.post('/api/foods/favorites', request),
  removeFavorite: async (externalId: string) => apiClient.delete(`/api/foods/favorites/${encodeURIComponent(externalId)}`),
};
