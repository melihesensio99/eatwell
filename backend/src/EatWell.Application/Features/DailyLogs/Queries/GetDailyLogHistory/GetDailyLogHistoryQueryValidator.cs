using FluentValidation;

namespace EatWell.Application.Features.DailyLogs.Queries.GetDailyLogHistory;

public sealed class GetDailyLogHistoryQueryValidator : AbstractValidator<GetDailyLogHistoryQuery>
{
    public GetDailyLogHistoryQueryValidator()
    {
        RuleFor(query => query.FromDate).NotEqual(default(DateOnly));
        RuleFor(query => query.ToDate).NotEqual(default(DateOnly));
        RuleFor(query => query)
            .Must(query => query.FromDate <= query.ToDate)
            .WithMessage("Başlangıç tarihi bitiş tarihinden sonra olamaz.");
        RuleFor(query => query)
            .Must(query => query.ToDate.DayNumber - query.FromDate.DayNumber <= 31)
            .WithMessage("En fazla 32 günlük geçmiş sorgulanabilir.");
    }
}
