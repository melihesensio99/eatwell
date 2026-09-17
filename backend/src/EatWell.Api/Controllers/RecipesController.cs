using EatWell.Application.Features.Recipes.Queries.GenerateRecipe;
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
    public async Task<IActionResult> Generate(
        [FromBody] GenerateRecipeQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await sender.Send(query, cancellationToken));
    }
}
