using EatWell.Application.Features.Recipes.Queries.GenerateRecipe;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EatWell.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/recipes")]
public sealed class RecipesController(ISender sender) : ControllerBase
{
    [HttpPost("generate")]
    public async Task<IActionResult> Generate(
        [FromBody] GenerateRecipeQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await sender.Send(query, cancellationToken));
    }
}
