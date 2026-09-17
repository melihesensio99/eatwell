using FluentValidation;

namespace EatWell.Application.Features.Foods.Commands.AddFavoriteFood;

public sealed class AddFavoriteFoodCommandValidator : AbstractValidator<AddFavoriteFoodCommand>
{
    public AddFavoriteFoodCommandValidator()
    {
        RuleFor(command => command.FoodExternalId).NotEmpty().MaximumLength(128);
        RuleFor(command => command.FoodName).NotEmpty().MaximumLength(300);
    }
}
