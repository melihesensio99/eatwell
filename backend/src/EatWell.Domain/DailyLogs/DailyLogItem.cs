namespace EatWell.Domain.DailyLogs;

public sealed class DailyLogItem
{
    public Guid Id { get; private set; }
    public Guid DailyLogId { get; private set; }
    public string FoodExternalId { get; private set; } = string.Empty;
    public string FoodName { get; private set; } = string.Empty;
    public string? Brand { get; private set; }
    public string? Barcode { get; private set; }
    public decimal QuantityGrams { get; private set; }
    public decimal? Calories { get; private set; }
    public decimal? ProteinGrams { get; private set; }
    public decimal? CarbohydratesGrams { get; private set; }
    public decimal? FatGrams { get; private set; }
    public string MealType { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }

    public DailyLog DailyLog { get; private set; } = null!;

    private DailyLogItem() { }

    public DailyLogItem(
        Guid dailyLogId,
        string foodExternalId,
        string foodName,
        decimal quantityGrams,
        string mealType,
        decimal? calories,
        decimal? proteinGrams,
        decimal? carbohydratesGrams,
        decimal? fatGrams,
        string? brand = null,
        string? barcode = null)
    {
        Id = Guid.NewGuid();
        DailyLogId = dailyLogId;
        FoodExternalId = foodExternalId;
        FoodName = foodName;
        QuantityGrams = quantityGrams;
        MealType = mealType;
        Calories = calories;
        ProteinGrams = proteinGrams;
        CarbohydratesGrams = carbohydratesGrams;
        FatGrams = fatGrams;
        Brand = brand;
        Barcode = barcode;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void AddQuantity(
        decimal quantityGrams,
        decimal? calories,
        decimal? proteinGrams,
        decimal? carbohydratesGrams,
        decimal? fatGrams)
    {
        QuantityGrams += quantityGrams;
        Calories = AddNullable(Calories, calories);
        ProteinGrams = AddNullable(ProteinGrams, proteinGrams);
        CarbohydratesGrams = AddNullable(CarbohydratesGrams, carbohydratesGrams);
        FatGrams = AddNullable(FatGrams, fatGrams);
    }

    private static decimal? AddNullable(decimal? current, decimal? added) =>
        current.HasValue && added.HasValue
            ? current.Value + added.Value
            : current ?? added;

    public void UpdateQuantityAndNutrition(
        decimal quantityGrams,
        decimal? calories,
        decimal? proteinGrams,
        decimal? carbohydratesGrams,
        decimal? fatGrams)
    {
        QuantityGrams = quantityGrams;
        Calories = calories;
        ProteinGrams = proteinGrams;
        CarbohydratesGrams = carbohydratesGrams;
        FatGrams = fatGrams;
    }
}
