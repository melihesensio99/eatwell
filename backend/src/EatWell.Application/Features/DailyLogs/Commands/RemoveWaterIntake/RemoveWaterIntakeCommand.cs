using MediatR;

namespace EatWell.Application.Features.DailyLogs.Commands.RemoveWaterIntake;

public sealed record RemoveWaterIntakeCommand(decimal Milliliters, DateOnly LogDate) : IRequest;
