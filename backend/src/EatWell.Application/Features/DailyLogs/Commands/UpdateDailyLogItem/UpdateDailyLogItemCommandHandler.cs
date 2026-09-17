using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Commands.UpdateDailyLogItem;

public sealed class UpdateDailyLogItemCommandHandler(
    IDailyLogRepository dailyLogRepository,
    ICurrentUser currentUser) : IRequestHandler<UpdateDailyLogItemCommand>
{
    public async Task Handle(UpdateDailyLogItemCommand command, CancellationToken cancellationToken)
    {
        var dailyLog = await dailyLogRepository.GetByItemIdAsync(command.ItemId, cancellationToken);
        var item = dailyLog?.Items.FirstOrDefault(current => current.Id == command.ItemId);

        if (dailyLog is null || item is null || dailyLog.UserId != currentUser.UserId)
            throw new KeyNotFoundException("Daily log item bulunamadı.");

        var factor = command.QuantityGrams / 100m;
        item.UpdateQuantityAndNutrition(
            command.QuantityGrams,
            Scale(command.CaloriesPer100Grams, factor),
            Scale(command.ProteinPer100Grams, factor),
            Scale(command.CarbohydratesPer100Grams, factor),
            Scale(command.FatPer100Grams, factor));

        await dailyLogRepository.SaveChangesAsync(cancellationToken);
    }

    private static decimal? Scale(decimal? value, decimal factor) =>
        value.HasValue ? value.Value * factor : null;
}
