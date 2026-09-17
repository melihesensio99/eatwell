using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Commands.DeleteDailyLogItem;

public sealed class DeleteDailyLogItemCommandHandler(
    IDailyLogRepository dailyLogRepository,
    ICurrentUser currentUser) : IRequestHandler<DeleteDailyLogItemCommand>
{
    public async Task Handle(DeleteDailyLogItemCommand command, CancellationToken cancellationToken)
    {
        var dailyLog = await dailyLogRepository.GetByItemIdAsync(command.ItemId, cancellationToken);
        var item = dailyLog?.Items.FirstOrDefault(current => current.Id == command.ItemId);

        if (dailyLog is null || item is null || dailyLog.UserId != currentUser.UserId)
            throw new KeyNotFoundException("Daily log item bulunamadı.");

        dailyLog.RemoveItem(command.ItemId);

        if (dailyLog.Items.Count == 0)
            await dailyLogRepository.RemoveAsync(dailyLog, cancellationToken);

        await dailyLogRepository.SaveChangesAsync(cancellationToken);
    }
}
