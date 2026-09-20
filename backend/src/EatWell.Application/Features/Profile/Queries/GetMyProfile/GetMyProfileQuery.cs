using MediatR;

namespace EatWell.Application.Features.Profile.Queries.GetMyProfile;

public sealed record GetMyProfileQuery : IRequest<MyProfileResponse?>;

public sealed record MyProfileResponse(
    string UserId,
    string? DisplayName,
    decimal? WeightKg,
    decimal? HeightCm,
    int? Age,
    int? WaterGoalMilliliters,
    string? Gender,
    DateTimeOffset UpdatedAt);
