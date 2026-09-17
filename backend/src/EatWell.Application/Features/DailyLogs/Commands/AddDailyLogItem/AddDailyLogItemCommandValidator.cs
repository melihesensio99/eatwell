using FluentValidation;

namespace EatWell.Application.Features.DailyLogs.Commands.AddDailyLogItem;

public sealed class AddDailyLogItemCommandValidator : AbstractValidator<AddDailyLogItemCommand>
{
    public AddDailyLogItemCommandValidator()
    {
        RuleFor(command => command.FoodExternalId).NotEmpty().MaximumLength(128);
        RuleFor(command => command.FoodName).NotEmpty().MaximumLength(300);
        RuleFor(command => command.QuantityGrams).GreaterThan(0);
        RuleFor(command => command.MealType).NotEmpty().MaximumLength(30);
        RuleFor(command => command.MealType)
            .Must(mealType => mealType is "breakfast" or "lunch" or "dinner" or "snack")
            .WithMessage("MealType breakfast, lunch, dinner veya snack olmalıdır.");
        RuleFor(command => command.LogDate).NotEqual(default(DateOnly));
    }
}
