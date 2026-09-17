using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.DailyLogs;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Queries.GetWeeklyNutritionSummary;

public sealed class GetWeeklyNutritionSummaryQueryHandler(
    IDailyLogRepository dailyLogRepository,
    INutritionGoalRepository nutritionGoalRepository,
    ICurrentUser currentUser)
    : IRequestHandler<GetWeeklyNutritionSummaryQuery, WeeklyNutritionSummaryDto>
{
    public async Task<WeeklyNutritionSummaryDto> Handle(
        GetWeeklyNutritionSummaryQuery query,
        CancellationToken cancellationToken)
    {
        var weekEnd = query.WeekStart.AddDays(6);
        var logs = await dailyLogRepository.GetHistoryAsync(
            currentUser.UserId, query.WeekStart, weekEnd, cancellationToken);
        var goal = await nutritionGoalRepository.GetByUserIdAsync(
            currentUser.UserId, cancellationToken);

        var days = Enumerable.Range(0, 7)
            .Select(offset =>
            {
                var date = query.WeekStart.AddDays(offset);
                var log = logs.FirstOrDefault(x => x.LogDate == date);
                var calories = log?.TotalCalories ?? 0;
                return new WeeklyNutritionDayDto(
                    date,
                    calories,
                    goal?.DailyCalories,
                    log?.TotalProteinGrams ?? 0,
                    goal?.ProteinGrams,
                    log?.TotalCarbohydratesGrams ?? 0,
                    goal?.CarbohydratesGrams,
                    log?.TotalFatGrams ?? 0,
                    goal?.FatGrams,
                    Percentage(goal?.DailyCalories, calories),
                    log is not null);
            })
            .ToArray();

        return new WeeklyNutritionSummaryDto(
            query.WeekStart,
            weekEnd,
            goal?.DailyCalories,
            goal?.ProteinGrams,
            goal?.CarbohydratesGrams,
            goal?.FatGrams,
            Average(days.Select(x => x.ConsumedCalories)),
            Average(days.Select(x => x.ConsumedProteinGrams)),
            Average(days.Select(x => x.ConsumedCarbohydratesGrams)),
            Average(days.Select(x => x.ConsumedFatGrams)),
            AverageNullable(days.Select(x => x.CalorieCompletionPercentage)),
            days);
    }

    private static decimal Average(IEnumerable<decimal> values) =>
        Math.Round(values.DefaultIfEmpty().Average(), 2);

    private static decimal? AverageNullable(IEnumerable<decimal?> values)
    {
        var existing = values.Where(x => x.HasValue).Select(x => x!.Value).ToArray();
        return existing.Length == 0 ? null : Math.Round(existing.Average(), 2);
    }

    private static decimal? Percentage(decimal? target, decimal consumed) =>
        target is > 0 ? Math.Round(consumed / target.Value * 100, 2) : null;
}
