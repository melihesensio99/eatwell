namespace EatWell.Domain.Users;

public sealed class UserProfile
{
    public string UserId { get; private set; } = string.Empty;
    public string? DisplayName { get; private set; }
    public decimal? WeightKg { get; private set; }
    public decimal? HeightCm { get; private set; }
    public string? Gender { get; private set; }
    public DateOnly? BirthDate { get; private set; }
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
        string? gender,
        DateOnly? birthDate)
    {
        DisplayName = displayName?.Trim();
        WeightKg = weightKg;
        HeightCm = heightCm;
        Gender = gender?.Trim().ToLowerInvariant();
        BirthDate = birthDate;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
