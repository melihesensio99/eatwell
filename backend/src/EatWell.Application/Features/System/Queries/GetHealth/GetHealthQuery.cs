using MediatR;

namespace EatWell.Application.Features.System.Queries.GetHealth;

public sealed record GetHealthQuery : IRequest<GetHealthResponse>;

public sealed record GetHealthResponse(
    string Status,
    DateTimeOffset Timestamp,
    string Version);
