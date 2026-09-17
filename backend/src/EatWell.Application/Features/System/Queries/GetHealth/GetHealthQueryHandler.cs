using MediatR;

namespace EatWell.Application.Features.System.Queries.GetHealth;

public sealed class GetHealthQueryHandler
    : IRequestHandler<GetHealthQuery, GetHealthResponse>
{
    public Task<GetHealthResponse> Handle(
        GetHealthQuery request,
        CancellationToken cancellationToken)
    {
        var response = new GetHealthResponse(
            Status: "Healthy",
            Timestamp: DateTimeOffset.UtcNow,
            Version: "1.0.0");

        return Task.FromResult(response);
    }
}
