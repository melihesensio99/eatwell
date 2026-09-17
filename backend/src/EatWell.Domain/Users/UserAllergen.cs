namespace EatWell.Domain.Users;

public sealed class UserAllergen
{
    public string UserId { get; private set; } = string.Empty;
    public string AllergenTag { get; private set; } = string.Empty;

    private UserAllergen() { }

    public UserAllergen(string userId, string allergenTag)
    {
        UserId = userId;
        AllergenTag = allergenTag;
    }
}
