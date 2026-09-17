using MediatR;

namespace EatWell.Application.Features.Profile.Commands.SetMyAllergens;

public sealed record SetMyAllergensCommand(IReadOnlyList<string> Allergens) : IRequest;
