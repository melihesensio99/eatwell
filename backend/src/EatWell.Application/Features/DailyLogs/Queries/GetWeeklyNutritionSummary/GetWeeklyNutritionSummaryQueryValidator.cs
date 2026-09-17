using FluentValidation;

namespace EatWell.Application.Features.DailyLogs.Queries.GetWeeklyNutritionSummary;

public sealed class GetWeeklyNutritionSummaryQueryValidator
    : AbstractValidator<GetWeeklyNutritionSummaryQuery>
{
    public GetWeeklyNutritionSummaryQueryValidator()
    {
        RuleFor(x => x.WeekStart)
            .Must(date => date != default)
            .WithMessage("weekStart is required.");
    }
}
