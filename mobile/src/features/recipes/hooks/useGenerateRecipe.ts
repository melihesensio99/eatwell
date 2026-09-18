import { useMutation } from '@tanstack/react-query';
import { recipesService, GenerateRecipeRequest } from '../api/recipes.service';

export function useGenerateRecipe() {
  return useMutation({ mutationFn: (request: GenerateRecipeRequest) => recipesService.generate(request) });
}
