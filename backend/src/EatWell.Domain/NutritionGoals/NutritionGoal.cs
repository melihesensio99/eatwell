namespace EatWell.Domain.NutritionGoals;

public enum NutritionGoalSource
{
    Manual = 1,
    Ai = 2
}

public sealed class NutritionGoal
{
    public string UserId { get; private set; } = string.Empty;
    public decimal DailyCalories { get; private set; }
    public decimal? ProteinGrams { get; private set; }
    public decimal? CarbohydratesGrams { get; private set; }
    public decimal? FatGrams { get; private set; }
    public string? ActivityLevel { get; private set; }
    public string? GoalType { get; private set; }
    public decimal? TargetWeightKg { get; private set; }
    public NutritionGoalSource Source { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    private NutritionGoal() { }

    public NutritionGoal(string userId)
    {
        UserId = userId;
    }

    public void SetManual(
        decimal dailyCalories,
        decimal? proteinGrams,
        decimal? carbohydratesGrams,
        decimal? fatGrams)
    {
        DailyCalories = dailyCalories;
        ProteinGrams = proteinGrams;
        CarbohydratesGrams = carbohydratesGrams;
        FatGrams = fatGrams;
        ActivityLevel = null;
        GoalType = null;
        TargetWeightKg = null;
        Source = NutritionGoalSource.Manual;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetFromAi(
        decimal dailyCalories,
        decimal proteinGrams,
        decimal carbohydratesGrams,
        decimal fatGrams,
        string activityLevel,
        string goalType,
        decimal? targetWeightKg)
    {
        DailyCalories = dailyCalories;
        ProteinGrams = proteinGrams;
        CarbohydratesGrams = carbohydratesGrams;
        FatGrams = fatGrams;
        ActivityLevel = activityLevel;
        GoalType = goalType;
        TargetWeightKg = targetWeightKg;
        Source = NutritionGoalSource.Ai;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
