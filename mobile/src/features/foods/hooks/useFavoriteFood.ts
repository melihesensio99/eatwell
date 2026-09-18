import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FavoriteFoodRequest, foodsService } from '../api/foods.service';
export function useFavoriteFood() { const client = useQueryClient(); return useMutation({ mutationFn: (request: FavoriteFoodRequest) => foodsService.addFavorite(request), onSuccess: () => { client.invalidateQueries({ queryKey: ['foods-favorites'] }); client.invalidateQueries({ queryKey: ['foods-recent'] }); } }); }
