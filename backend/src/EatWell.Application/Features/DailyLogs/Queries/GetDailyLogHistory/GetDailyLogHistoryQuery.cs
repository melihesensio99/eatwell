using EatWell.Application.Common.DailyLogs;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Queries.GetDailyLogHistory;

public sealed record GetDailyLogHistoryQuery(
    DateOnly FromDate,
    DateOnly ToDate) : IRequest<IReadOnlyList<DailyLogDto>>;
