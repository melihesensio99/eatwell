using EatWell.Application.Common.DailyLogs;
using MediatR;

namespace EatWell.Application.Features.DailyLogs.Queries.GetDailySummary;

public sealed record GetDailySummaryQuery(DateOnly LogDate) : IRequest<DailySummaryDto?>;
