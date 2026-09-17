using EatWell.Application.Common.DailyLogs;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Queries.GetDailyLog;

public sealed record GetDailyLogQuery(DateOnly LogDate) : IRequest<DailyLogDto?>;
