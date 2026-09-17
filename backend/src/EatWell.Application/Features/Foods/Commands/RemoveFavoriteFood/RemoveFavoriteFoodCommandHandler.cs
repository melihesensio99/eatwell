using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.Foods.Commands.RemoveFavoriteFood;

public sealed class RemoveFavoriteFoodCommandHandler(
    IFavoriteFoodRepository favoriteFoodRepository,
    ICurrentUser currentUser) : IRequestHandler<RemoveFavoriteFoodCommand>
{
    public async Task Handle(RemoveFavoriteFoodCommand command, CancellationToken cancellationToken)
    {
        await favoriteFoodRepository.RemoveAsync(
            currentUser.UserId, command.FoodExternalId, cancellationToken);
        await favoriteFoodRepository.SaveChangesAsync(cancellationToken);
    }
}
