namespace EatWell.Application.Common.DailyLogs;

public sealed record DailySummaryDto(
    DateOnly LogDate,
    decimal WaterConsumedMilliliters,
    decimal ConsumedCalories,
    decimal? TargetCalories,
    decimal? RemainingCalories,
    decimal? CalorieCompletionPercentage,
    decimal ConsumedProteinGrams,
    decimal? TargetProteinGrams,
    decimal? RemainingProteinGrams,
    decimal ConsumedCarbohydratesGrams,
    decimal? TargetCarbohydratesGrams,
    decimal? RemainingCarbohydratesGrams,
    decimal ConsumedFatGrams,
    decimal? TargetFatGrams,
    decimal? RemainingFatGrams,
    DailyCalorieChartPointDto CalorieChart);

public sealed record DailyCalorieChartPointDto(
    decimal ConsumedCalories,
    decimal? TargetCalories);
