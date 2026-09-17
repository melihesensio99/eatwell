namespace EatWell.Application.Common.DailyLogs;

public sealed record DailyLogDto(
    Guid Id,
    DateOnly LogDate,
    decimal WaterConsumedMilliliters,
    decimal TotalCalories,
    decimal TotalProteinGrams,
    decimal TotalCarbohydratesGrams,
    decimal TotalFatGrams,
    IReadOnlyList<DailyLogMealSummaryDto> MealSummaries,
    IReadOnlyList<DailyLogItemDto> Items);

public sealed record DailyLogMealSummaryDto(
    string MealType,
    decimal TotalCalories,
    decimal TotalProteinGrams,
    decimal TotalCarbohydratesGrams,
    decimal TotalFatGrams);

public sealed record DailyLogItemDto(
    Guid Id,
    string FoodExternalId,
    string FoodName,
    string? Brand,
    string? Barcode,
    decimal QuantityGrams,
    decimal? Calories,
    decimal? ProteinGrams,
    decimal? CarbohydratesGrams,
    decimal? FatGrams,
    string MealType);
