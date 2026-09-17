using MediatR;

namespace EatWell.Application.Features.Profile.Commands.UpdateMyProfile;

public sealed record UpdateMyProfileCommand(
    string? DisplayName,
    decimal? WeightKg,
    decimal? HeightCm,
    string? Gender,
    DateOnly? BirthDate) : IRequest<UpdateMyProfileResponse>;

public sealed record UpdateMyProfileResponse(
    string UserId,
    string? DisplayName,
    decimal? WeightKg,
    decimal? HeightCm,
    string? Gender,
    DateOnly? BirthDate,
    DateTimeOffset UpdatedAt);
