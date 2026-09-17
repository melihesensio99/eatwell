using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Foods;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.Foods.Queries.GetSavedFoods;

public sealed class GetSavedFoodsQueryHandler(
    IFavoriteFoodRepository favoriteFoodRepository,
    ICurrentUser currentUser) : IRequestHandler<GetSavedFoodsQuery, IReadOnlyList<SavedFoodDto>>
{
    public async Task<IReadOnlyList<SavedFoodDto>> Handle(
        GetSavedFoodsQuery query,
        CancellationToken cancellationToken)
    {
        var foods = query.RecentOnly
            ? await favoriteFoodRepository.GetRecentAsync(currentUser.UserId, 20, cancellationToken)
            : await favoriteFoodRepository.GetFavoritesAsync(currentUser.UserId, cancellationToken);

        return foods.Select(food => new SavedFoodDto(
            food.FoodExternalId,
            food.FoodName,
            food.Brand,
            food.Barcode,
            food.CaloriesPer100Grams,
            food.ProteinPer100Grams,
            food.CarbohydratesPer100Grams,
            food.FatPer100Grams,
            food.ImageUrl)).ToArray();
    }
}
