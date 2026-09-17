using FluentValidation;

namespace EatWell.Application.Features.Recipes.Queries.GenerateRecipe;

public sealed class GenerateRecipeQueryValidator : AbstractValidator<GenerateRecipeQuery>
{
    public GenerateRecipeQueryValidator()
    {
        RuleFor(x => x.Ingredients)
            .Must(x => x.Count <= 10)
            .WithMessage("En fazla 10 malzeme gönderilebilir.");

        RuleFor(x => x)
            .Must(x => x.Ingredients.Any() || !string.IsNullOrWhiteSpace(x.ImageBase64))
            .WithMessage("En az bir malzeme veya fotoğraf gönderilmelidir.");

        RuleForEach(x => x.Ingredients)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Servings)
            .InclusiveBetween(1, 12);

        RuleFor(x => x.DietaryPreference)
            .MaximumLength(100)
            .When(x => x.DietaryPreference is not null);

        RuleFor(x => x.ImageBase64)
            .MaximumLength(7_000_000)
            .When(x => x.ImageBase64 is not null);

        RuleFor(x => x.MimeType)
            .Must(type => type is "image/jpeg" or "image/png" or "image/webp")
            .When(x => !string.IsNullOrWhiteSpace(x.ImageBase64))
            .WithMessage("Sadece jpeg, png veya webp görseller kabul edilir.");
    }
}
