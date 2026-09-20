using EatWell.Domain.NutritionGoals;
using MediatR;

namespace EatWell.Application.Features.NutritionGoals.Commands.SetManual;

public sealed record SetManualNutritionGoalCommand(
    decimal DailyCalories,
    decimal? ProteinGrams,
    decimal? CarbohydratesGrams,
    decimal? FatGrams,
    int WaterGoalMilliliters) : IRequest;
