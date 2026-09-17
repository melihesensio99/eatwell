namespace EatWell.Application.Common.DailyLogs;

public sealed record WeeklyNutritionSummaryDto(
    DateOnly WeekStart,
    DateOnly WeekEnd,
    decimal? DailyCaloriesTarget,
    decimal? DailyProteinTarget,
    decimal? DailyCarbohydratesTarget,
    decimal? DailyFatTarget,
    decimal AverageCalories,
    decimal AverageProteinGrams,
    decimal AverageCarbohydratesGrams,
    decimal AverageFatGrams,
    decimal? AverageCalorieCompletionPercentage,
    IReadOnlyList<WeeklyNutritionDayDto> Days);

public sealed record WeeklyNutritionDayDto(
    DateOnly Date,
    decimal ConsumedCalories,
    decimal? TargetCalories,
    decimal ConsumedProteinGrams,
    decimal? TargetProteinGrams,
    decimal ConsumedCarbohydratesGrams,
    decimal? TargetCarbohydratesGrams,
    decimal ConsumedFatGrams,
    decimal? TargetFatGrams,
    decimal? CalorieCompletionPercentage,
    bool HasLog);
