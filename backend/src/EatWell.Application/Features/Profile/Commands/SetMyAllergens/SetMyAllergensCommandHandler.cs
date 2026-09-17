using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.Profile.Commands.SetMyAllergens;

public sealed class SetMyAllergensCommandHandler(
    IUserProfileRepository userProfileRepository,
    IUserAllergenRepository userAllergenRepository,
    ICurrentUser currentUser) : IRequestHandler<SetMyAllergensCommand>
{
    public async Task Handle(SetMyAllergensCommand command, CancellationToken cancellationToken)
    {
        var profile = await userProfileRepository.GetByUserIdAsync(
            currentUser.UserId, cancellationToken);
        if (profile is null)
            throw new InvalidOperationException("Önce kullanıcı profili oluşturulmalıdır.");

        var tags = command.Allergens
            .Select(NormalizeTag)
            .Where(tag => tag.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        await userAllergenRepository.ReplaceAsync(
            currentUser.UserId, tags, cancellationToken);
    }

    private static string NormalizeTag(string tag)
    {
        var separatorIndex = tag.LastIndexOf(':');
        return (separatorIndex >= 0 ? tag[(separatorIndex + 1)..] : tag)
            .Trim()
            .ToLowerInvariant();
    }
}
