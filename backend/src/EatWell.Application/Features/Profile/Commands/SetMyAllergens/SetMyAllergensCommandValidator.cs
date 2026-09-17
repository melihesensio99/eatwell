using FluentValidation;

namespace EatWell.Application.Features.Profile.Commands.SetMyAllergens;

public sealed class SetMyAllergensCommandValidator : AbstractValidator<SetMyAllergensCommand>
{
    public SetMyAllergensCommandValidator()
    {
        RuleFor(command => command.Allergens).Must(allergens => allergens.Count <= 20);
        RuleForEach(command => command.Allergens)
            .NotEmpty()
            .MaximumLength(100);
    }
}
