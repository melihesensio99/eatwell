import { useQuery } from '@tanstack/react-query';
import { foodsService } from '../api/foods.service';
import { FoodSearchResultDto } from '../../../types/api';
export function useRecentFoods() { return useQuery({ queryKey: ['foods-recent'], queryFn: foodsService.getRecent, select: (foods): FoodSearchResultDto[] => foods.map((food) => ({ externalId: food.foodExternalId, name: food.foodName, brand: food.brand, barcode: food.barcode, caloriesPer100Grams: food.caloriesPer100Grams, proteinPer100Grams: food.proteinPer100Grams, carbohydratesPer100Grams: food.carbohydratesPer100Grams, fatPer100Grams: food.fatPer100Grams, imageUrl: food.imageUrl })), staleTime: 60_000 }); }
