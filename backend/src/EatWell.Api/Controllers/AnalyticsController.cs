using EatWell.Application.Features.DailyLogs.Queries.GetWeeklyNutritionSummary;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EatWell.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/analytics")]
public sealed class AnalyticsController(ISender sender) : ControllerBase
{
    [HttpGet("weekly-summary")]
    public async Task<IActionResult> GetWeeklySummary(
        [FromQuery] DateOnly weekStart,
        CancellationToken cancellationToken)
    {
        return Ok(await sender.Send(
            new GetWeeklyNutritionSummaryQuery(weekStart), cancellationToken));
    }
}
