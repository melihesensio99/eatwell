using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using EatWell.Domain.Users;
using MediatR;

namespace EatWell.Application.Features.Foods.Commands.AddFavoriteFood;

public sealed class AddFavoriteFoodCommandHandler(
    IUserProfileRepository userProfileRepository,
    IFavoriteFoodRepository favoriteFoodRepository,
    ICurrentUser currentUser) : IRequestHandler<AddFavoriteFoodCommand>
{
    public async Task Handle(AddFavoriteFoodCommand command, CancellationToken cancellationToken)
    {
        var profile = await userProfileRepository.GetByUserIdAsync(
            currentUser.UserId, cancellationToken);
        if (profile is null)
            throw new InvalidOperationException("Önce kullanıcı profili oluşturulmalıdır.");

        if (await favoriteFoodRepository.ExistsAsync(
                currentUser.UserId, command.FoodExternalId, cancellationToken))
            return;

        await favoriteFoodRepository.AddAsync(new FavoriteFood(
            currentUser.UserId,
            command.FoodExternalId,
            command.FoodName,
            command.Brand,
            command.Barcode,
            command.CaloriesPer100Grams,
            command.ProteinPer100Grams,
            command.CarbohydratesPer100Grams,
            command.FatPer100Grams,
            command.ImageUrl), cancellationToken);
        await favoriteFoodRepository.SaveChangesAsync(cancellationToken);
    }
}
