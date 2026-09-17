using EatWell.Domain.NutritionGoals;

namespace EatWell.Application.Common.Nutrition;

public sealed record NutritionGoalDto(
    string UserId,
    decimal DailyCalories,
    decimal? ProteinGrams,
    decimal? CarbohydratesGrams,
    decimal? FatGrams,
    NutritionGoalSource Source,
    DateTimeOffset UpdatedAt);
