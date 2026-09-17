using EatWell.Application.Common.Recipes;
using MediatR;

namespace EatWell.Application.Features.Recipes.Queries.GenerateRecipe;

public sealed class GenerateRecipeQueryHandler(IRecipeGenerationProvider provider)
    : IRequestHandler<GenerateRecipeQuery, GeneratedRecipeDto>
{
    public async Task<GeneratedRecipeDto> Handle(
        GenerateRecipeQuery query,
        CancellationToken cancellationToken)
    {
        var ingredients = query.Ingredients
            .Select(x => x.Trim())
            .Where(x => x.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var result = await provider.GenerateAsync(
            new RecipeGenerationInputDto(
                ingredients,
                query.Servings,
                query.DietaryPreference?.Trim(),
                query.ImageBase64,
                query.MimeType),
            cancellationToken);

        var searchText = Uri.EscapeDataString($"{result.RecipeName} tarifi");
        return result with
        {
            YoutubeSearchUrl = $"https://www.youtube.com/results?search_query={searchText}"
        };
    }
}
