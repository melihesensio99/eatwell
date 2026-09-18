namespace EatWell.Application.Common.Foods;

public sealed record FoodSearchResultDto(
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
    int? NovaGroup);
