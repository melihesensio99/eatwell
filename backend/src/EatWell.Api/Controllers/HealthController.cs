using EatWell.Application.Features.System.Queries.GetHealth;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EatWell.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    private readonly ISender _sender;

    public HealthController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<ActionResult<GetHealthResponse>> Get(
        CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(new GetHealthQuery(), cancellationToken));
    }
}
