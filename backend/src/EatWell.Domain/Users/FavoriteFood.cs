namespace EatWell.Domain.Users;

public sealed class FavoriteFood
{
    public string UserId { get; private set; } = string.Empty;
    public string FoodExternalId { get; private set; } = string.Empty;
    public string FoodName { get; private set; } = string.Empty;
    public string? Brand { get; private set; }
    public string? Barcode { get; private set; }
    public decimal? CaloriesPer100Grams { get; private set; }
    public decimal? ProteinPer100Grams { get; private set; }
    public decimal? CarbohydratesPer100Grams { get; private set; }
    public decimal? FatPer100Grams { get; private set; }
    public string? ImageUrl { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private FavoriteFood() { }

    public FavoriteFood(
        string userId,
        string foodExternalId,
        string foodName,
        string? brand,
        string? barcode,
        decimal? caloriesPer100Grams,
        decimal? proteinPer100Grams,
        decimal? carbohydratesPer100Grams,
        decimal? fatPer100Grams,
        string? imageUrl)
    {
        UserId = userId;
        FoodExternalId = foodExternalId;
        FoodName = foodName;
        Brand = brand;
        Barcode = barcode;
        CaloriesPer100Grams = caloriesPer100Grams;
        ProteinPer100Grams = proteinPer100Grams;
        CarbohydratesPer100Grams = carbohydratesPer100Grams;
        FatPer100Grams = fatPer100Grams;
        ImageUrl = imageUrl;
        CreatedAt = DateTimeOffset.UtcNow;
    }
}
