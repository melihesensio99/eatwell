using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.DailyLogs;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Queries.GetDailyLogHistory;

public sealed class GetDailyLogHistoryQueryHandler(
    IDailyLogRepository dailyLogRepository,
    ICurrentUser currentUser)
    : IRequestHandler<GetDailyLogHistoryQuery, IReadOnlyList<DailyLogDto>>
{
    public async Task<IReadOnlyList<DailyLogDto>> Handle(
        GetDailyLogHistoryQuery query,
        CancellationToken cancellationToken)
    {
        var dailyLogs = await dailyLogRepository.GetHistoryAsync(
            currentUser.UserId,
            query.FromDate,
            query.ToDate,
            cancellationToken);

        return dailyLogs.Select(log => new DailyLogDto(
            log.Id,
            log.LogDate,
            log.WaterConsumedMilliliters,
            log.TotalCalories,
            log.TotalProteinGrams,
            log.TotalCarbohydratesGrams,
            log.TotalFatGrams,
            log.Items.GroupBy(item => item.MealType).Select(group =>
                new DailyLogMealSummaryDto(
                    group.Key,
                    group.Sum(item => item.Calories ?? 0),
                    group.Sum(item => item.ProteinGrams ?? 0),
                    group.Sum(item => item.CarbohydratesGrams ?? 0),
                    group.Sum(item => item.FatGrams ?? 0))).ToArray(),
            log.Items.Select(item => new DailyLogItemDto(
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
                item.MealType)).ToArray())).ToArray();
    }
}
