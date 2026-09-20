using EatWell.Domain.NutritionGoals;

namespace EatWell.Application.Common.Nutrition;

public sealed record NutritionGoalDto(
    string UserId,
    decimal DailyCalories,
    decimal? ProteinGrams,
    decimal? CarbohydratesGrams,
    decimal? FatGrams,
    string? ActivityLevel,
    string? GoalType,
    decimal? TargetWeightKg,
    NutritionGoalSource Source,
    DateTimeOffset UpdatedAt);
