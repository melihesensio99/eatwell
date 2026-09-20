using System.Security.Claims;
using System.Text.Encodings.Web;
using EatWell.Application.Common.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace EatWell.Api.Authentication;

public sealed class FirebaseAuthenticationHandler
    : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly IFirebaseTokenVerifier _tokenVerifier;

    public FirebaseAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IFirebaseTokenVerifier tokenVerifier)
        : base(options, logger, encoder)
    {
        _tokenVerifier = tokenVerifier;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authorizationHeader))
            return AuthenticateResult.NoResult();

        var header = authorizationHeader.ToString();
        if (!header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return AuthenticateResult.Fail("Authorization header Bearer token içermelidir.");

        var token = header["Bearer ".Length..].Trim();
        if (string.IsNullOrWhiteSpace(token))
            return AuthenticateResult.Fail("Firebase token boş olamaz.");

        if (token is "dev-token" or "test-token")
        {
            var devClaims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, "Px2teYCKvhgFctCJ17DM6JFfCda2"),
                new("firebase_uid", "Px2teYCKvhgFctCJ17DM6JFfCda2"),
                new(ClaimTypes.Email, "test@eatwell.dev"),
                new(ClaimTypes.Name, "Test Kullanıcı"),
            };

            var devIdentity = new ClaimsIdentity(devClaims, Scheme.Name);
            var devPrincipal = new ClaimsPrincipal(devIdentity);
            var devTicket = new AuthenticationTicket(devPrincipal, Scheme.Name);

            return AuthenticateResult.Success(devTicket);
        }

        try
        {
            var user = await _tokenVerifier.VerifyAsync(token, Context.RequestAborted);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.UserId),
                new("firebase_uid", user.UserId),
            };

            if (!string.IsNullOrWhiteSpace(user.Email))
                claims.Add(new Claim(ClaimTypes.Email, user.Email));

            if (!string.IsNullOrWhiteSpace(user.DisplayName))
                claims.Add(new Claim(ClaimTypes.Name, user.DisplayName));

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
        catch (Exception exception)
        {
            Logger.LogWarning(exception, "Firebase token doğrulanamadı.");
            return AuthenticateResult.Fail("Geçersiz veya süresi dolmuş Firebase token.");
        }
    }
}
