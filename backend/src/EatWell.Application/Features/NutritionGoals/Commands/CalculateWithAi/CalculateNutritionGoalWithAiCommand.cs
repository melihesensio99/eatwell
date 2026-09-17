using EatWell.Application.Common.Nutrition;
using MediatR;

namespace EatWell.Application.Features.NutritionGoals.Commands.CalculateWithAi;

public sealed record CalculateNutritionGoalWithAiCommand(
    string ActivityLevel,
    string Goal,
    decimal? TargetWeightKg) : IRequest<NutritionGoalCalculationDto>;
