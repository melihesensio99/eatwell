using FluentValidation;

namespace EatWell.Application.Features.DailyLogs.Commands.UpdateDailyLogItem;

public sealed class UpdateDailyLogItemCommandValidator : AbstractValidator<UpdateDailyLogItemCommand>
{
    public UpdateDailyLogItemCommandValidator()
    {
        RuleFor(command => command.ItemId).NotEmpty();
        RuleFor(command => command.QuantityGrams).GreaterThan(0);
    }
}
