using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using EatWell.Domain.DailyLogs;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Commands.AddDailyLogItem;

public sealed class AddDailyLogItemCommandHandler(
    IDailyLogRepository dailyLogRepository,
    IUserProfileRepository userProfileRepository,
    ICurrentUser currentUser)
    : IRequestHandler<AddDailyLogItemCommand, Guid>
{
    public async Task<Guid> Handle(
        AddDailyLogItemCommand command,
        CancellationToken cancellationToken)
    {
        var profile = await userProfileRepository.GetByUserIdAsync(
            currentUser.UserId, cancellationToken);
        if (profile is null)
            throw new InvalidOperationException("Önce kullanıcı profili oluşturulmalıdır.");

        var dailyLog = await dailyLogRepository.GetByUserAndDateAsync(
            currentUser.UserId, command.LogDate, cancellationToken);

        if (dailyLog is null)
        {
            dailyLog = new DailyLog(currentUser.UserId, command.LogDate);
            await dailyLogRepository.AddAsync(dailyLog, cancellationToken);
        }

        var factor = command.QuantityGrams / 100m;

        var item = dailyLog.AddItem(
            command.FoodExternalId,
            command.FoodName,
            command.QuantityGrams,
            command.MealType,
            Scale(command.CaloriesPer100Grams, factor),
            Scale(command.ProteinPer100Grams, factor),
            Scale(command.CarbohydratesPer100Grams, factor),
            Scale(command.FatPer100Grams, factor),
            command.Brand,
            command.Barcode);

        await dailyLogRepository.SaveChangesAsync(cancellationToken);
        return item.Id;
    }

    private static decimal? Scale(decimal? valuePer100Grams, decimal factor) =>
        valuePer100Grams.HasValue ? valuePer100Grams.Value * factor : null;
}
