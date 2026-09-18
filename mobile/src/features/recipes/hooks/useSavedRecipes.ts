import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GeneratedRecipeDto, savedRecipesService } from '../api/recipes.service';
export function useSavedRecipes() { return useQuery({ queryKey: ['saved-recipes'], queryFn: savedRecipesService.getAll, staleTime: 60_000 }); }
export function useSaveRecipe() { const client = useQueryClient(); return useMutation({ mutationFn: (recipe: GeneratedRecipeDto) => savedRecipesService.save(recipe), onSuccess: () => client.invalidateQueries({ queryKey: ['saved-recipes'] }) }); }
export function useRemoveRecipe() { const client = useQueryClient(); return useMutation({ mutationFn: savedRecipesService.remove, onSuccess: () => client.invalidateQueries({ queryKey: ['saved-recipes'] }) }); }
