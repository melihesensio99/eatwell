using EatWell.Application.Common.DailyLogs;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Queries.GetWeeklyNutritionSummary;

public sealed record GetWeeklyNutritionSummaryQuery(DateOnly WeekStart)
    : IRequest<WeeklyNutritionSummaryDto>;
