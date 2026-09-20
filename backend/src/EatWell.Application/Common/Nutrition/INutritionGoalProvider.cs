namespace EatWell.Application.Common.Nutrition;

public interface INutritionGoalProvider
{
    Task<NutritionGoalCalculationDto> CalculateAsync(
        NutritionGoalInputDto input,
        CancellationToken cancellationToken = default);
}

public sealed record NutritionGoalInputDto(
    string Gender,
    int Age,
    decimal WeightKg,
    decimal HeightCm,
    string ActivityLevel,
    string Goal,
    decimal? TargetWeightKg);

public sealed record NutritionGoalCalculationDto(
    decimal DailyCalories,
    decimal ProteinGrams,
    decimal CarbohydratesGrams,
    decimal FatGrams,
    decimal Bmr,
    decimal Tdee,
    decimal GoalAdjustmentPercentage,
    IReadOnlyList<string> Assumptions,
    IReadOnlyList<string> Warnings,
    decimal WaterGoalMilliliters = 0);
