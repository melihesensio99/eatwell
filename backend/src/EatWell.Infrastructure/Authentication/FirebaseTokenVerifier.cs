using EatWell.Application.Common.Authentication;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;

namespace EatWell.Infrastructure.Authentication;

public sealed class FirebaseTokenVerifier : IFirebaseTokenVerifier
{
    private readonly Lazy<FirebaseAuth> _firebaseAuth;

    public FirebaseTokenVerifier(IConfiguration configuration)
    {
        _firebaseAuth = new Lazy<FirebaseAuth>(() =>
        {
            var projectId = configuration["Firebase:ProjectId"];
            var credentialsPath = configuration["Firebase:CredentialsPath"];

            var options = new AppOptions();

            if (!string.IsNullOrWhiteSpace(credentialsPath))
                options.Credential = CredentialFactory
                    .FromFile<ServiceAccountCredential>(credentialsPath)
                    .ToGoogleCredential();
            else
                options.Credential = GoogleCredential.GetApplicationDefault();

            if (!string.IsNullOrWhiteSpace(projectId))
                options.ProjectId = projectId;

            var app = FirebaseApp.DefaultInstance ?? FirebaseApp.Create(options);
            return FirebaseAuth.GetAuth(app);
        });
    }

    public async Task<AuthenticatedUser> VerifyAsync(
        string idToken,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(idToken))
            throw new ArgumentException("Firebase ID token boş olamaz.", nameof(idToken));

        cancellationToken.ThrowIfCancellationRequested();
        var decodedToken = await _firebaseAuth.Value.VerifyIdTokenAsync(idToken);

        decodedToken.Claims.TryGetValue("email", out var email);
        decodedToken.Claims.TryGetValue("name", out var displayName);

        return new AuthenticatedUser(
            decodedToken.Uid,
            email?.ToString(),
            displayName?.ToString());
    }
}
