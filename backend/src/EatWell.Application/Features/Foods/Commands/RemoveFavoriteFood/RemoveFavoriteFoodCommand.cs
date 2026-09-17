using MediatR;

namespace EatWell.Application.Features.Foods.Commands.RemoveFavoriteFood;

public sealed record RemoveFavoriteFoodCommand(string FoodExternalId) : IRequest;
