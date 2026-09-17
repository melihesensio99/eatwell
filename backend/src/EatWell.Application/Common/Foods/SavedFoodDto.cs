namespace EatWell.Application.Common.Foods;

public sealed record SavedFoodDto(
    string FoodExternalId,
    string FoodName,
    string? Brand,
    string? Barcode,
    decimal? CaloriesPer100Grams,
    decimal? ProteinPer100Grams,
    decimal? CarbohydratesPer100Grams,
    decimal? FatPer100Grams,
    string? ImageUrl);
