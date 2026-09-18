import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { foodsService } from '../api/foods.service';
export function useFavorites() { return useQuery({ queryKey: ['foods-favorites'], queryFn: foodsService.getFavorites, staleTime: 60_000 }); }
export function useRemoveFavorite() { const client = useQueryClient(); return useMutation({ mutationFn: foodsService.removeFavorite, onSuccess: () => { client.invalidateQueries({ queryKey: ['foods-favorites'] }); client.invalidateQueries({ queryKey: ['foods-recent'] }); } }); }
