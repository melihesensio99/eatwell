using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using FluentValidation;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Commands.RemoveWaterIntake;

public sealed class RemoveWaterIntakeCommandHandler(
    IDailyLogRepository dailyLogRepository,
    ICurrentUser currentUser) : IRequestHandler<RemoveWaterIntakeCommand>
{
    public async Task Handle(RemoveWaterIntakeCommand command, CancellationToken cancellationToken)
    {
        var dailyLog = await dailyLogRepository.GetByUserAndDateAsync(
            currentUser.UserId, command.LogDate, cancellationToken);
        if (dailyLog is null || !dailyLog.RemoveWater(command.Milliliters))
            throw new ValidationException("Günlük su toplamı çıkarılacak miktardan az olamaz.");

        await dailyLogRepository.SaveChangesAsync(cancellationToken);
    }
}
