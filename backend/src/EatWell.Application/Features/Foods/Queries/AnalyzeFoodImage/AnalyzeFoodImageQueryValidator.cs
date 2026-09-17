using EatWell.Application.Common.Foods;
using FluentValidation;

namespace EatWell.Application.Features.Foods.Queries.AnalyzeFoodImage;

public sealed class AnalyzeFoodImageQueryValidator : AbstractValidator<AnalyzeFoodImageQuery>
{
    public AnalyzeFoodImageQueryValidator()
    {
        RuleFor(query => query).Custom((query, context) =>
        {
            if (!ImagePayloadValidator.TryDecode(
                    query.ImageBase64, query.MimeType, out _, out var error))
            {
                context.AddFailure("ImageBase64", error);
            }
        });
    }
}
