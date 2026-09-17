using MediatR;

namespace EatWell.Application.Features.DailyLogs.Commands.DeleteDailyLogItem;

public sealed record DeleteDailyLogItemCommand(Guid ItemId) : IRequest;
