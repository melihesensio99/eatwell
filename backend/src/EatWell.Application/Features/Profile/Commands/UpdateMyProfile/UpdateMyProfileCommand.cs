using MediatR;

namespace EatWell.Application.Features.Profile.Commands.UpdateMyProfile;

public sealed record UpdateMyProfileCommand(
    string? DisplayName,
    decimal? WeightKg,
    decimal? HeightCm,
    int? Age,
    int? WaterGoalMilliliters,
    string? Gender) : IRequest<UpdateMyProfileResponse>;

public sealed record UpdateMyProfileResponse(
    string UserId,
    string? DisplayName,
    decimal? WeightKg,
    decimal? HeightCm,
    int? Age,
    int? WaterGoalMilliliters,
    string? Gender,
    DateTimeOffset UpdatedAt);
