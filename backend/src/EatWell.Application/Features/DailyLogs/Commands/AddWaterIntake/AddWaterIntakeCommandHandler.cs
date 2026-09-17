using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using EatWell.Domain.DailyLogs;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Commands.AddWaterIntake;

public sealed class AddWaterIntakeCommandHandler(
    IDailyLogRepository dailyLogRepository,
    IUserProfileRepository userProfileRepository,
    ICurrentUser currentUser) : IRequestHandler<AddWaterIntakeCommand>
{
    public async Task Handle(AddWaterIntakeCommand command, CancellationToken cancellationToken)
    {
        var profile = await userProfileRepository.GetByUserIdAsync(currentUser.UserId, cancellationToken);
        if (profile is null)
            throw new InvalidOperationException("Önce kullanıcı profili oluşturulmalıdır.");

        var dailyLog = await dailyLogRepository.GetByUserAndDateAsync(
            currentUser.UserId, command.LogDate, cancellationToken);
        if (dailyLog is null)
        {
            dailyLog = new DailyLog(currentUser.UserId, command.LogDate);
            await dailyLogRepository.AddAsync(dailyLog, cancellationToken);
        }

        dailyLog.AddWater(command.Milliliters);
        await dailyLogRepository.SaveChangesAsync(cancellationToken);
    }
}
