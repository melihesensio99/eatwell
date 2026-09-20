namespace EatWell.Domain.Users;

public sealed class UserProfile
{
    public string UserId { get; private set; } = string.Empty;
    public string? DisplayName { get; private set; }
    public decimal? WeightKg { get; private set; }
    public decimal? HeightCm { get; private set; }
    public int? Age { get; private set; }
    public int? WaterGoalMilliliters { get; private set; }
    public string? Gender { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    private UserProfile() { }

    public UserProfile(string userId)
    {
        UserId = userId;
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = CreatedAt;
    }

    public void Update(
        string? displayName,
        decimal? weightKg,
        decimal? heightCm,
        int? age,
        int? waterGoalMilliliters,
        string? gender)
    {
        DisplayName = displayName?.Trim();
        WeightKg = weightKg;
        HeightCm = heightCm;
        Age = age;
        WaterGoalMilliliters = waterGoalMilliliters;
        Gender = gender?.Trim().ToLowerInvariant();
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetWaterGoal(int milliliters)
    {
        WaterGoalMilliliters = milliliters;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
