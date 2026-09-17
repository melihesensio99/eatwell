using EatWell.Application.Features.NutritionGoals.Commands.CalculateWithAi;
using EatWell.Application.Features.NutritionGoals.Commands.SetManual;
using EatWell.Application.Features.NutritionGoals.Queries.GetMy;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EatWell.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/nutrition-goals")]
public sealed class NutritionGoalsController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var goal = await sender.Send(new GetMyNutritionGoalQuery(), cancellationToken);
        return goal is null ? NotFound() : Ok(goal);
    }

    [HttpPut("manual")]
    public async Task<IActionResult> SetManual(
        [FromBody] SetManualNutritionGoalCommand command,
        CancellationToken cancellationToken)
    {
        await sender.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpPost("calculate-with-ai")]
    public async Task<IActionResult> CalculateWithAi(
        [FromBody] CalculateNutritionGoalWithAiCommand command,
        CancellationToken cancellationToken)
    {
        return Ok(await sender.Send(command, cancellationToken));
    }
}
