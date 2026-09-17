namespace EatWell.Application.Common.Authentication;

public interface IFirebaseTokenVerifier
{
    Task<AuthenticatedUser> VerifyAsync(
        string idToken,
        CancellationToken cancellationToken = default);
}
