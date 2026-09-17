using MediatR;

namespace EatWell.Application.Features.Profile.Queries.GetMyAllergens;

public sealed record GetMyAllergensQuery : IRequest<IReadOnlyList<string>>;
