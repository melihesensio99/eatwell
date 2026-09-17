using EatWell.Application.Features.Foods.Queries.GetFoodByBarcode;
using EatWell.Application.Features.Foods.Queries.SearchFoods;
using EatWell.Application.Features.Foods.Queries.AnalyzeFoodImage;
using EatWell.Application.Features.Foods.Commands.AddFavoriteFood;
using EatWell.Application.Features.Foods.Commands.RemoveFavoriteFood;
using EatWell.Application.Features.Foods.Queries.GetSavedFoods;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

namespace EatWell.Api.Controllers;

[ApiController]
[Route("api/foods")]
public sealed class FoodsController(ISender sender) : ControllerBase
{
    [HttpGet("favorites")]
    [Authorize]
    public async Task<IActionResult> GetFavorites(CancellationToken cancellationToken)
    {
        return Ok(await sender.Send(new GetSavedFoodsQuery(false), cancellationToken));
    }

    [HttpGet("recent")]
    [Authorize]
    public async Task<IActionResult> GetRecent(CancellationToken cancellationToken)
    {
        return Ok(await sender.Send(new GetSavedFoodsQuery(true), cancellationToken));
    }

    [HttpPost("favorites")]
    [Authorize]
    public async Task<IActionResult> AddFavorite(
        [FromBody] AddFavoriteFoodCommand command,
        CancellationToken cancellationToken)
    {
        await sender.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("favorites/{externalId}")]
    [Authorize]
    public async Task<IActionResult> RemoveFavorite(
        string externalId,
        CancellationToken cancellationToken)
    {
        await sender.Send(new RemoveFavoriteFoodCommand(externalId), cancellationToken);
        return NoContent();
    }

    [HttpPost("analyze-image")]
    [Authorize]
    [EnableRateLimiting("ai-expensive")]
    public async Task<IActionResult> AnalyzeImage(
        [FromBody] AnalyzeFoodImageQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await sender.Send(query, cancellationToken));
    }

    [HttpGet("search")]
    [EnableRateLimiting("external-food-search")]
    public async Task<IActionResult> Search(
        [FromQuery] string query,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest("query is required.");

        return Ok(await sender.Send(new SearchFoodsQuery(query), cancellationToken));
    }

    [HttpGet("barcode/{barcode}")]
    [Authorize]
    [EnableRateLimiting("external-food-barcode")]
    public async Task<IActionResult> GetByBarcode(
        string barcode,
        CancellationToken cancellationToken)
    {
        var food = await sender.Send(new GetFoodByBarcodeQuery(barcode), cancellationToken);
        return food is null ? NotFound() : Ok(food);
    }
}
