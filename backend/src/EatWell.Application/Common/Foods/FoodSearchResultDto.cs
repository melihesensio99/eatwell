namespace EatWell.Application.Common.Foods;

public sealed record FoodSearchResultDto(
    string ExternalId,
    string Name,
    string? Brand,
    string? Barcode,
    decimal? CaloriesPer100Grams,
    string? ImageUrl,
    string? NutriScore,
    int? NovaGroup);
