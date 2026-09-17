using EatWell.Domain.DailyLogs;

namespace EatWell.UnitTests;

public sealed class DailyLogTests
{
    [Fact]
    public void Same_food_and_meal_are_merged()
    {
        var dailyLog = new DailyLog("user-1", new DateOnly(2026, 9, 17));

        var first = dailyLog.AddItem("food-1", "Tavuk", 100, "lunch", 165, 31, 0, 3.6m);
        var second = dailyLog.AddItem("food-1", "Tavuk", 100, "lunch", 165, 31, 0, 3.6m);

        Assert.Equal(first.Id, second.Id);
        Assert.Single(dailyLog.Items);
        Assert.Equal(200, first.QuantityGrams);
        Assert.Equal(330, dailyLog.TotalCalories);
        Assert.Equal(62, dailyLog.TotalProteinGrams);
    }

    [Fact]
    public void Same_food_in_different_meals_stays_separate()
    {
        var dailyLog = new DailyLog("user-1", new DateOnly(2026, 9, 17));

        dailyLog.AddItem("food-1", "Tavuk", 100, "breakfast", 165, 31, 0, 3.6m);
        dailyLog.AddItem("food-1", "Tavuk", 100, "dinner", 165, 31, 0, 3.6m);

        Assert.Equal(2, dailyLog.Items.Count);
        Assert.Equal(330, dailyLog.TotalCalories);
    }

    [Fact]
    public void Removing_item_updates_daily_totals()
    {
        var dailyLog = new DailyLog("user-1", new DateOnly(2026, 9, 17));
        var item = dailyLog.AddItem("food-1", "Tavuk", 200, "lunch", 330, 62, 0, 7.2m);

        Assert.True(dailyLog.RemoveItem(item.Id));
        Assert.Empty(dailyLog.Items);
        Assert.Equal(0, dailyLog.TotalCalories);
    }
}
