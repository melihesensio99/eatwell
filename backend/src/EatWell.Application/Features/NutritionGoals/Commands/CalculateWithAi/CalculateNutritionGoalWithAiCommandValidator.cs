using FluentValidation;

namespace EatWell.Application.Features.NutritionGoals.Commands.CalculateWithAi;

public sealed class CalculateNutritionGoalWithAiCommandValidator
    : AbstractValidator<CalculateNutritionGoalWithAiCommand>
{
    public CalculateNutritionGoalWithAiCommandValidator()
    {
        RuleFor(command => command.ActivityLevel)
            .Must(level => level is "sedentary" or "light" or "moderate" or "active" or "very_active")
            .WithMessage("ActivityLevel sedentary, light, moderate, active veya very_active olmalıdır.");

        RuleFor(command => command.Goal)
            .Must(goal => goal is "lose_weight" or "maintain_weight" or "gain_weight")
            .WithMessage("Goal lose_weight, maintain_weight veya gain_weight olmalıdır.");

        RuleFor(command => command.TargetWeightKg)
            .InclusiveBetween(20, 500)
            .When(command => command.TargetWeightKg.HasValue);
    }
}
