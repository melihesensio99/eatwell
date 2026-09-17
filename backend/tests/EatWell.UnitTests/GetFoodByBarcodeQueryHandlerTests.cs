using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Foods;
using EatWell.Application.Common.Persistence;
using EatWell.Application.Features.Foods.Queries.GetFoodByBarcode;

namespace EatWell.UnitTests;

public sealed class GetFoodByBarcodeQueryHandlerTests
{
    [Fact]
    public async Task Handler_returns_warning_when_product_matches_user_allergen()
    {
        var handler = CreateHandler(["milk", "nuts"]);

        var result = await handler.Handle(
            new GetFoodByBarcodeQuery("123"), CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result.HasAllergenWarning);
        Assert.Contains("milk", result.MatchedUserAllergens);
        Assert.DoesNotContain("soybeans", result.MatchedUserAllergens);
    }

    [Fact]
    public async Task Handler_returns_no_warning_when_product_does_not_match_user_allergens()
    {
        var handler = CreateHandler(["peanuts"]);

        var result = await handler.Handle(
            new GetFoodByBarcodeQuery("123"), CancellationToken.None);

        Assert.NotNull(result);
        Assert.False(result.HasAllergenWarning);
        Assert.Empty(result.MatchedUserAllergens);
    }

    private static GetFoodByBarcodeQueryHandler CreateHandler(IReadOnlyList<string> userAllergens)
    {
        return new GetFoodByBarcodeQueryHandler(
            new FakeFoodProvider(),
            new FakeUserAllergenRepository(userAllergens),
            new FakeCurrentUser("user-1"));
    }

    private sealed class FakeCurrentUser(string userId) : ICurrentUser
    {
        public string UserId { get; } = userId;
    }

    private sealed class FakeUserAllergenRepository(IReadOnlyList<string> allergens)
        : IUserAllergenRepository
    {
        public Task<IReadOnlyList<string>> GetTagsByUserIdAsync(
            string userId, CancellationToken cancellationToken) =>
            Task.FromResult(allergens);

        public Task ReplaceAsync(
            string userId,
            IReadOnlyCollection<string> tags,
            CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class FakeFoodProvider : IFoodProvider
    {
        public Task<IReadOnlyList<FoodSearchResultDto>> SearchAsync(
            string query, CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<FoodSearchResultDto>>([]);

        public Task<FoodDetailsDto?> GetByBarcodeAsync(
            string barcode, CancellationToken cancellationToken = default) =>
            Task.FromResult<FoodDetailsDto?>(new FoodDetailsDto(
                "123", "Test Food", "Test Brand", "123", 100, 5, 10, 2,
                "https://example.com/image.jpg", "b", 3, "milk, nuts", ["en:milk", "en:soybeans"],
                4, 1, 0.1m));
    }
}
