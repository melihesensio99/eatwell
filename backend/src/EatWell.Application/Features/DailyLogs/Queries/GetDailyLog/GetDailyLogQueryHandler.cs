using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.DailyLogs;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Queries.GetDailyLog;

public sealed class GetDailyLogQueryHandler(
    IDailyLogRepository dailyLogRepository,
    ICurrentUser currentUser)
    : IRequestHandler<GetDailyLogQuery, DailyLogDto?>
{
    public async Task<DailyLogDto?> Handle(
        GetDailyLogQuery query,
        CancellationToken cancellationToken)
    {
        var dailyLog = await dailyLogRepository.GetByUserAndDateAsync(
            currentUser.UserId, query.LogDate, cancellationToken);

        return dailyLog is null
            ? null
            : new DailyLogDto(
                dailyLog.Id,
                dailyLog.LogDate,
                dailyLog.WaterConsumedMilliliters,
                dailyLog.TotalCalories,
                dailyLog.TotalProteinGrams,
                dailyLog.TotalCarbohydratesGrams,
                dailyLog.TotalFatGrams,
                dailyLog.Items.GroupBy(item => item.MealType).Select(group =>
                    new DailyLogMealSummaryDto(
                        group.Key,
                        group.Sum(item => item.Calories ?? 0),
                        group.Sum(item => item.ProteinGrams ?? 0),
                        group.Sum(item => item.CarbohydratesGrams ?? 0),
                        group.Sum(item => item.FatGrams ?? 0))).ToArray(),
                dailyLog.Items.Select(item => new DailyLogItemDto(
                    item.Id,
                    item.FoodExternalId,
                    item.FoodName,
                    item.Brand,
                    item.Barcode,
                    item.QuantityGrams,
                    item.Calories,
                    item.ProteinGrams,
                    item.CarbohydratesGrams,
                    item.FatGrams,
                    item.MealType)).ToArray());
    }
}
