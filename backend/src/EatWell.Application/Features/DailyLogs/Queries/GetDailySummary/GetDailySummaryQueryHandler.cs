using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.DailyLogs;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Queries.GetDailySummary;

public sealed class GetDailySummaryQueryHandler(
    IDailyLogRepository dailyLogRepository,
    INutritionGoalRepository nutritionGoalRepository,
    ICurrentUser currentUser)
    : IRequestHandler<GetDailySummaryQuery, DailySummaryDto?>
{
    public async Task<DailySummaryDto?> Handle(
        GetDailySummaryQuery query,
        CancellationToken cancellationToken)
    {
        var dailyLog = await dailyLogRepository.GetByUserAndDateAsync(
            currentUser.UserId, query.LogDate, cancellationToken);
        var goal = await nutritionGoalRepository.GetByUserIdAsync(
            currentUser.UserId, cancellationToken);

        if (dailyLog is null && goal is null)
            return null;

        var consumedCalories = dailyLog?.TotalCalories ?? 0;
        var consumedProtein = dailyLog?.TotalProteinGrams ?? 0;
        var consumedCarbohydrates = dailyLog?.TotalCarbohydratesGrams ?? 0;
        var consumedFat = dailyLog?.TotalFatGrams ?? 0;

        return new DailySummaryDto(
            query.LogDate,
            dailyLog?.WaterConsumedMilliliters ?? 0,
            consumedCalories,
            goal?.DailyCalories,
            Remaining(goal?.DailyCalories, consumedCalories),
            Percentage(goal?.DailyCalories, consumedCalories),
            consumedProtein,
            goal?.ProteinGrams,
            Remaining(goal?.ProteinGrams, consumedProtein),
            consumedCarbohydrates,
            goal?.CarbohydratesGrams,
            Remaining(goal?.CarbohydratesGrams, consumedCarbohydrates),
            consumedFat,
            goal?.FatGrams,
            Remaining(goal?.FatGrams, consumedFat),
            new DailyCalorieChartPointDto(consumedCalories, goal?.DailyCalories));
    }

    private static decimal? Remaining(decimal? target, decimal consumed) =>
        target.HasValue ? Math.Max(0, target.Value - consumed) : null;

    private static decimal? Percentage(decimal? target, decimal consumed) =>
        target is > 0 ? Math.Round(consumed / target.Value * 100, 2) : null;
}
