using EatWell.Application.Common.Recipes;
using MediatR;

namespace EatWell.Application.Features.Recipes.Queries.GenerateRecipe;

public sealed record GenerateRecipeQuery(
    IReadOnlyList<string> Ingredients,
    int Servings,
    string? DietaryPreference,
    string? ImageBase64,
    string? MimeType) : IRequest<GeneratedRecipeDto>;
