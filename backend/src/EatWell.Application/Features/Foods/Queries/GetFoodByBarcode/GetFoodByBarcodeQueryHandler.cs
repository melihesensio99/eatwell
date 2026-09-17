using EatWell.Application.Common.Foods;
using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.Foods.Queries.GetFoodByBarcode;

public sealed class GetFoodByBarcodeQueryHandler(
    IFoodProvider foodProvider,
    IUserAllergenRepository userAllergenRepository,
    ICurrentUser currentUser)
    : IRequestHandler<GetFoodByBarcodeQuery, FoodDetailsDto?>
{
    public async Task<FoodDetailsDto?> Handle(
        GetFoodByBarcodeQuery request,
        CancellationToken cancellationToken)
    {
        var food = await foodProvider.GetByBarcodeAsync(request.Barcode, cancellationToken);
        if (food is null)
            return null;

        var userAllergens = await userAllergenRepository.GetTagsByUserIdAsync(
            currentUser.UserId, cancellationToken);
        var normalizedUserAllergens = userAllergens
            .Select(NormalizeTag)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var matches = food.AllergensTags
            .Select(NormalizeTag)
            .Where(normalizedUserAllergens.Contains)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return food with { MatchedUserAllergens = matches };
    }

    private static string NormalizeTag(string tag)
    {
        var separatorIndex = tag.LastIndexOf(':');
        return (separatorIndex >= 0 ? tag[(separatorIndex + 1)..] : tag)
            .Trim()
            .ToLowerInvariant();
    }
}
