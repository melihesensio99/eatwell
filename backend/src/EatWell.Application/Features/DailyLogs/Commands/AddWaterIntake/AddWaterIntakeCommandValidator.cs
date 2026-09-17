using FluentValidation;

namespace EatWell.Application.Features.DailyLogs.Commands.AddWaterIntake;

public sealed class AddWaterIntakeCommandValidator : AbstractValidator<AddWaterIntakeCommand>
{
    public AddWaterIntakeCommandValidator()
    {
        RuleFor(x => x.Milliliters).InclusiveBetween(1, 5000)
            .WithMessage("Su miktarı 1 ile 5000 ml arasında olmalıdır.");
        RuleFor(x => x.LogDate).NotEqual(default(DateOnly));
    }
}
