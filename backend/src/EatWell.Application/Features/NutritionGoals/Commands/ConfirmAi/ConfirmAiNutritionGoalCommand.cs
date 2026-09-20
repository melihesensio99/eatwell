using MediatR;

namespace EatWell.Application.Features.NutritionGoals.Commands.ConfirmAi;

public sealed record ConfirmAiNutritionGoalCommand(
    decimal DailyCalories,
    decimal ProteinGrams,
    decimal CarbohydratesGrams,
    decimal FatGrams,
    string ActivityLevel,
    string Goal,
    decimal? TargetWeightKg,
    int WaterGoalMilliliters) : IRequest;
