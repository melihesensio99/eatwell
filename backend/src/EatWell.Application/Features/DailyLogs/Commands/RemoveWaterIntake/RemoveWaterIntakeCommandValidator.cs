using FluentValidation;

namespace EatWell.Application.Features.DailyLogs.Commands.RemoveWaterIntake;

public sealed class RemoveWaterIntakeCommandValidator : AbstractValidator<RemoveWaterIntakeCommand>
{
    public RemoveWaterIntakeCommandValidator()
    {
        RuleFor(x => x.Milliliters).InclusiveBetween(1, 5000)
            .WithMessage("Su miktarı 1 ile 5000 ml arasında olmalıdır.");
        RuleFor(x => x.LogDate).NotEqual(default(DateOnly));
    }
}
