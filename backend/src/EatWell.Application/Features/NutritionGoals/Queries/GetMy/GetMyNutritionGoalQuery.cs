using EatWell.Application.Common.Nutrition;
using MediatR;

namespace EatWell.Application.Features.NutritionGoals.Queries.GetMy;

public sealed record GetMyNutritionGoalQuery : IRequest<NutritionGoalDto?>;
