using FluentValidation;

namespace EatWell.Application.Features.NutritionGoals.Commands.ConfirmAi;

public sealed class ConfirmAiNutritionGoalCommandValidator : AbstractValidator<ConfirmAiNutritionGoalCommand>
{
    public ConfirmAiNutritionGoalCommandValidator()
    {
        RuleFor(command => command.DailyCalories).InclusiveBetween(800, 6000);
        RuleFor(command => command.ProteinGrams).InclusiveBetween(0, 500);
        RuleFor(command => command.CarbohydratesGrams).InclusiveBetween(0, 1000);
        RuleFor(command => command.FatGrams).InclusiveBetween(0, 300);
    }
}
