namespace EatWell.Application.Common.Authentication;

public sealed record AuthenticatedUser(
    string UserId,
    string? Email,
    string? DisplayName);
