using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using EatWell.Domain.Users;
using MediatR;

namespace EatWell.Application.Features.Profile.Commands.UpdateMyProfile;

public sealed class UpdateMyProfileCommandHandler
    : IRequestHandler<UpdateMyProfileCommand, UpdateMyProfileResponse>
{
    private readonly ICurrentUser _currentUser;
    private readonly IUserProfileRepository _profiles;

    public UpdateMyProfileCommandHandler(ICurrentUser currentUser, IUserProfileRepository profiles)
    {
        _currentUser = currentUser;
        _profiles = profiles;
    }

    public async Task<UpdateMyProfileResponse> Handle(
        UpdateMyProfileCommand request,
        CancellationToken cancellationToken)
    {
        var profile = await _profiles.GetByUserIdAsync(_currentUser.UserId, cancellationToken);

        if (profile is null)
        {
            profile = new UserProfile(_currentUser.UserId);
            await _profiles.AddAsync(profile, cancellationToken);
        }

        profile.Update(
            request.DisplayName,
            request.WeightKg,
            request.HeightCm,
            request.Gender,
            request.BirthDate);

        await _profiles.SaveChangesAsync(cancellationToken);

        return new UpdateMyProfileResponse(
            profile.UserId,
            profile.DisplayName,
            profile.WeightKg,
            profile.HeightCm,
            profile.Gender,
            profile.BirthDate,
            profile.UpdatedAt);
    }
}
