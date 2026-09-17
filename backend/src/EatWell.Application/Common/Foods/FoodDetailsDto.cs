namespace EatWell.Application.Common.Foods;

public sealed record FoodDetailsDto(
    string ExternalId,
    string Name,
    string? Brand,
    string? Barcode,
    decimal? CaloriesPer100Grams,
    decimal? ProteinPer100Grams,
    decimal? CarbohydratesPer100Grams,
    decimal? FatPer100Grams,
    string? ImageUrl,
    string? NutriScore,
    int? NovaGroup,
    string? IngredientsText,
    IReadOnlyList<string> AllergensTags,
    decimal? SugarsPer100Grams,
    decimal? SaturatedFatPer100Grams,
    decimal? SaltPer100Grams)
{
    public IReadOnlyList<string> MatchedUserAllergens { get; init; } = [];
    public bool HasAllergenWarning => MatchedUserAllergens.Count > 0;
}
