using EatWell.Application.Common.Recipes;

namespace EatWell.Application.Features.Recipes.Common;

public sealed record SavedRecipeDto(Guid Id, string RecipeName, string Description, IReadOnlyList<GeneratedRecipeIngredientDto> Ingredients, IReadOnlyList<string> Steps, int PreparationMinutes, int CookingMinutes, int Servings, decimal? CaloriesPerServing, decimal? ProteinGramsPerServing, decimal? CarbohydratesGramsPerServing, decimal? FatGramsPerServing, string YoutubeSearchUrl, DateTimeOffset CreatedAt);
