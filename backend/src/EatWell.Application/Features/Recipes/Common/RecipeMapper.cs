using System.Text.Json;
using EatWell.Domain.Recipes;

namespace EatWell.Application.Features.Recipes.Common;

public static class RecipeMapper
{
    public static SavedRecipeDto Map(SavedRecipe recipe) => new(recipe.Id, recipe.RecipeName, recipe.Description, JsonSerializer.Deserialize<List<EatWell.Application.Common.Recipes.GeneratedRecipeIngredientDto>>(recipe.IngredientsJson) ?? [], JsonSerializer.Deserialize<List<string>>(recipe.StepsJson) ?? [], recipe.PreparationMinutes, recipe.CookingMinutes, recipe.Servings, recipe.CaloriesPerServing, recipe.ProteinGramsPerServing, recipe.CarbohydratesGramsPerServing, recipe.FatGramsPerServing, recipe.YoutubeSearchUrl, recipe.CreatedAt);
}
