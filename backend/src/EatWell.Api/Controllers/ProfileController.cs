using EatWell.Application.Features.Profile.Commands.UpdateMyProfile;
using EatWell.Application.Features.Profile.Queries.GetMyProfile;
using EatWell.Application.Features.Profile.Commands.SetMyAllergens;
using EatWell.Application.Features.Profile.Queries.GetMyAllergens;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EatWell.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public sealed class ProfileController : ControllerBase
{
    private readonly ISender _sender;

    public ProfileController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<ActionResult<MyProfileResponse>> Get(
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetMyProfileQuery(), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut]
    public async Task<ActionResult<UpdateMyProfileResponse>> Update(
        UpdateMyProfileCommand command,
        CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(command, cancellationToken));
    }

    [HttpGet("allergens")]
    public async Task<IActionResult> GetAllergens(CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(new GetMyAllergensQuery(), cancellationToken));
    }

    [HttpPut("allergens")]
    public async Task<IActionResult> SetAllergens(
        [FromBody] SetMyAllergensCommand command,
        CancellationToken cancellationToken)
    {
        await _sender.Send(command, cancellationToken);
        return NoContent();
    }
}
