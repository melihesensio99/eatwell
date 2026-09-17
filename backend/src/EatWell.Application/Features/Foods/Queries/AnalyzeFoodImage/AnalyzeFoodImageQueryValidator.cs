using FluentValidation;

namespace EatWell.Application.Features.Foods.Queries.AnalyzeFoodImage;

public sealed class AnalyzeFoodImageQueryValidator : AbstractValidator<AnalyzeFoodImageQuery>
{
    private static readonly string[] AllowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    public AnalyzeFoodImageQueryValidator()
    {
        RuleFor(query => query.ImageBase64).NotEmpty().MaximumLength(7_000_000);
        RuleFor(query => query.MimeType).Must(mime => AllowedMimeTypes.Contains(mime.ToLowerInvariant()))
            .WithMessage("Sadece JPEG, PNG veya WEBP görseller desteklenir.");
    }
}
