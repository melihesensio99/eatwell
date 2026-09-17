namespace EatWell.Domain.DailyLogs;

public sealed class DailyLog
{
    private readonly List<DailyLogItem> _items = [];

    public Guid Id { get; private set; }
    public string UserId { get; private set; } = string.Empty;
    public DateOnly LogDate { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public decimal WaterConsumedMilliliters { get; private set; }
    public IReadOnlyCollection<DailyLogItem> Items => _items.AsReadOnly();
    public decimal TotalCalories => _items.Sum(item => item.Calories ?? 0);
    public decimal TotalProteinGrams => _items.Sum(item => item.ProteinGrams ?? 0);
    public decimal TotalCarbohydratesGrams => _items.Sum(item => item.CarbohydratesGrams ?? 0);
    public decimal TotalFatGrams => _items.Sum(item => item.FatGrams ?? 0);

    private DailyLog() { }

    public DailyLog(string userId, DateOnly logDate)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        CreatedAt = DateTimeOffset.UtcNow;
        LogDate = logDate;
    }

    public void AddWater(decimal milliliters) => WaterConsumedMilliliters += milliliters;

    public bool RemoveWater(decimal milliliters)
    {
        if (milliliters > WaterConsumedMilliliters)
            return false;

        WaterConsumedMilliliters -= milliliters;
        return true;
    }

    public DailyLogItem AddItem(
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
        var existingItem = _items.FirstOrDefault(item =>
            item.FoodExternalId == foodExternalId && item.MealType == mealType);

        if (existingItem is not null)
        {
            existingItem.AddQuantity(
                quantityGrams, calories, proteinGrams, carbohydratesGrams, fatGrams);
            return existingItem;
        }

        var item = new DailyLogItem(
            Id, foodExternalId, foodName, quantityGrams, mealType,
            calories, proteinGrams, carbohydratesGrams, fatGrams, brand, barcode);
        _items.Add(item);
        return item;
    }

    public bool RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(current => current.Id == itemId);
        return item is not null && _items.Remove(item);
    }
}
