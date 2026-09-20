using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.Profile.Queries.GetMyProfile;

public sealed class GetMyProfileQueryHandler
    : IRequestHandler<GetMyProfileQuery, MyProfileResponse?>
{
    private readonly ICurrentUser _currentUser;
    private readonly IUserProfileRepository _profiles;

    public GetMyProfileQueryHandler(ICurrentUser currentUser, IUserProfileRepository profiles)
    {
        _currentUser = currentUser;
        _profiles = profiles;
    }

    public async Task<MyProfileResponse?> Handle(
        GetMyProfileQuery request,
        CancellationToken cancellationToken)
    {
        var profile = await _profiles.GetByUserIdAsync(_currentUser.UserId, cancellationToken);
        return profile is null
            ? null
            : new MyProfileResponse(
                profile.UserId,
                profile.DisplayName,
                profile.WeightKg,
                profile.HeightCm,
                profile.Age,
                profile.WaterGoalMilliliters,
                profile.Gender,
                profile.UpdatedAt);
    }
}
