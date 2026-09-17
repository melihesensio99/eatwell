using EatWell.Application.Features.DailyLogs.Commands.AddDailyLogItem;
using EatWell.Application.Features.DailyLogs.Queries.GetDailyLog;
using EatWell.Application.Features.DailyLogs.Commands.UpdateDailyLogItem;
using EatWell.Application.Features.DailyLogs.Commands.DeleteDailyLogItem;
using EatWell.Application.Features.DailyLogs.Commands.AddWaterIntake;
using EatWell.Application.Features.DailyLogs.Commands.RemoveWaterIntake;
using EatWell.Application.Features.DailyLogs.Queries.GetDailyLogHistory;
using EatWell.Application.Features.DailyLogs.Queries.GetDailySummary;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EatWell.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/daily-logs")]
public sealed class DailyLogsController(ISender sender) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        if (date == default)
            return BadRequest("date is required.");

        var summary = await sender.Send(
            new GetDailySummaryQuery(date), cancellationToken);
        return summary is null ? NotFound() : Ok(summary);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory(
        [FromQuery] DateOnly fromDate,
        [FromQuery] DateOnly toDate,
        CancellationToken cancellationToken)
    {
        return Ok(await sender.Send(
            new GetDailyLogHistoryQuery(fromDate, toDate), cancellationToken));
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        if (date == default)
            return BadRequest("date is required.");

        var dailyLog = await sender.Send(new GetDailyLogQuery(date), cancellationToken);
        return dailyLog is null ? NotFound() : Ok(dailyLog);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(
        [FromBody] AddDailyLogItemCommand command,
        CancellationToken cancellationToken)
    {
        var itemId = await sender.Send(command, cancellationToken);
        return Ok(new { itemId });
    }

    [HttpPut("items/{itemId:guid}")]
    public async Task<IActionResult> UpdateItem(
        Guid itemId,
        [FromBody] UpdateDailyLogItemCommand command,
        CancellationToken cancellationToken)
    {
        if (itemId != command.ItemId)
            return BadRequest("Route itemId ile body ItemId aynı olmalıdır.");

        await sender.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> DeleteItem(
        Guid itemId,
        CancellationToken cancellationToken)
    {
        await sender.Send(new DeleteDailyLogItemCommand(itemId), cancellationToken);
        return NoContent();
    }

    [HttpPost("water")]
    public async Task<IActionResult> AddWater(
        [FromBody] AddWaterIntakeCommand command,
        CancellationToken cancellationToken)
    {
        await sender.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("water")]
    public async Task<IActionResult> RemoveWater(
        [FromBody] RemoveWaterIntakeCommand command,
        CancellationToken cancellationToken)
    {
        await sender.Send(command, cancellationToken);
        return NoContent();
    }
}
