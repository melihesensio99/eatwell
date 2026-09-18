using FluentValidation;

namespace EatWell.Application.Features.Recipes.Commands.SaveRecipe;

public sealed class SaveRecipeCommandValidator : AbstractValidator<SaveRecipeCommand>
{
    public SaveRecipeCommandValidator()
    {
        RuleFor(command => command.RecipeName).NotEmpty().MaximumLength(300);
        RuleFor(command => command.Description).NotEmpty().MaximumLength(4000);
        RuleFor(command => command.Ingredients).NotEmpty().Must(items => items.Count <= 10);
        RuleFor(command => command.Steps).NotEmpty().Must(items => items.Count <= 50);
        RuleFor(command => command.Servings).InclusiveBetween(1, 20);
        RuleFor(command => command.PreparationMinutes).InclusiveBetween(0, 1440);
        RuleFor(command => command.CookingMinutes).InclusiveBetween(0, 1440);
        RuleFor(command => command.YoutubeSearchUrl).NotEmpty().MaximumLength(1000);
        RuleForEach(command => command.Ingredients).ChildRules(ingredient =>
        {
            ingredient.RuleFor(item => item.Name).NotEmpty().MaximumLength(200);
            ingredient.RuleFor(item => item.Quantity).NotEmpty().MaximumLength(100);
        });
        RuleForEach(command => command.Steps).NotEmpty().MaximumLength(1000);
    }
}
