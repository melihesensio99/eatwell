namespace EatWell.Application.Common.Recipes;

public interface IRecipeGenerationProvider
{
    Task<GeneratedRecipeDto> GenerateAsync(
        RecipeGenerationInputDto input,
        CancellationToken cancellationToken = default);
}

public sealed record RecipeGenerationInputDto(
    IReadOnlyList<string> Ingredients,
    int Servings,
    string? DietaryPreference,
    string? ImageBase64,
    string? MimeType);

public sealed record GeneratedRecipeIngredientDto(
    string Name,
    string Quantity,
    string Source,
    decimal Confidence);

public sealed record GeneratedRecipeDto(
    string RecipeName,
    string Description,
    IReadOnlyList<GeneratedRecipeIngredientDto> Ingredients,
    IReadOnlyList<string> Steps,
    int PreparationMinutes,
    int CookingMinutes,
    int Servings,
    decimal? CaloriesPerServing,
    decimal? ProteinGramsPerServing,
    decimal? CarbohydratesGramsPerServing,
    decimal? FatGramsPerServing,
    IReadOnlyList<string> Assumptions,
    string YoutubeSearchUrl);
