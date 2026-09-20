using FluentValidation;

namespace EatWell.Application.Features.Profile.Commands.UpdateMyProfile;

public sealed class UpdateMyProfileCommandValidator : AbstractValidator<UpdateMyProfileCommand>
{
    public UpdateMyProfileCommandValidator()
    {
        RuleFor(command => command.DisplayName)
            .MaximumLength(100)
            .When(command => command.DisplayName is not null);

        RuleFor(command => command.WeightKg)
            .InclusiveBetween(20, 500)
            .When(command => command.WeightKg.HasValue);

        RuleFor(command => command.HeightCm)
            .InclusiveBetween(80, 250)
            .When(command => command.HeightCm.HasValue);

        RuleFor(command => command.Age)
            .InclusiveBetween(13, 120)
            .When(command => command.Age.HasValue);

        RuleFor(command => command.WaterGoalMilliliters)
            .InclusiveBetween(500, 10000)
            .When(command => command.WaterGoalMilliliters.HasValue);

        RuleFor(command => command.Gender)
            .Must(gender => gender is null || gender is "male" or "female" or "other")
            .WithMessage("Gender male, female veya other olmalıdır.");
    }
}
