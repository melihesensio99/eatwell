using MediatR;

namespace EatWell.Application.Features.DailyLogs.Commands.AddWaterIntake;

public sealed record AddWaterIntakeCommand(decimal Milliliters, DateOnly LogDate) : IRequest;
