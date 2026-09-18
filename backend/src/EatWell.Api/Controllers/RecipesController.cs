using EatWell.Application.Features.Recipes.Queries.GenerateRecipe;
using EatWell.Application.Features.Recipes.Commands.SaveRecipe;
using EatWell.Application.Features.Recipes.Commands.DeleteSavedRecipe;
using EatWell.Application.Features.Recipes.Queries.GetSavedRecipes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace EatWell.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/recipes")]
public sealed class RecipesController(ISender sender) : ControllerBase
{
    [HttpPost("generate")]
    [EnableRateLimiting("ai-expensive")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> Generate(
        [FromBody] GenerateRecipeQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await sender.Send(query, cancellationToken));
    }

    [HttpGet("saved")]
    public async Task<IActionResult> GetSaved(CancellationToken cancellationToken) => Ok(await sender.Send(new GetSavedRecipesQuery(), cancellationToken));

    [HttpPost("saved")]
    public async Task<IActionResult> Save([FromBody] SaveRecipeCommand command, CancellationToken cancellationToken) => Ok(await sender.Send(command, cancellationToken));

    [HttpDelete("saved/{id:guid}")]
    public async Task<IActionResult> DeleteSaved(Guid id, CancellationToken cancellationToken)
    {
        await sender.Send(new DeleteSavedRecipeCommand(id), cancellationToken);
        return NoContent();
    }
}
