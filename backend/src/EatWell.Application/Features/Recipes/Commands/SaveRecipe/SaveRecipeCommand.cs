using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using EatWell.Application.Common.Recipes;
using EatWell.Application.Features.Recipes.Common;
using System.Text.Json;
using MediatR;

namespace EatWell.Application.Features.Recipes.Commands.SaveRecipe;

public sealed record SaveRecipeCommand(string RecipeName, string Description, IReadOnlyList<GeneratedRecipeIngredientDto> Ingredients, IReadOnlyList<string> Steps, int PreparationMinutes, int CookingMinutes, int Servings, decimal? CaloriesPerServing, decimal? ProteinGramsPerServing, decimal? CarbohydratesGramsPerServing, decimal? FatGramsPerServing, string YoutubeSearchUrl) : IRequest<SavedRecipeDto>;

public sealed class SaveRecipeCommandHandler(ISavedRecipeRepository repository, ICurrentUser currentUser) : IRequestHandler<SaveRecipeCommand, SavedRecipeDto>
{
    public async Task<SavedRecipeDto> Handle(SaveRecipeCommand request, CancellationToken cancellationToken)
    {
        var recipe = new Domain.Recipes.SavedRecipe(currentUser.UserId, request.RecipeName.Trim(), request.Description.Trim(), JsonSerializer.Serialize(request.Ingredients), JsonSerializer.Serialize(request.Steps), request.PreparationMinutes, request.CookingMinutes, request.Servings, request.CaloriesPerServing, request.ProteinGramsPerServing, request.CarbohydratesGramsPerServing, request.FatGramsPerServing, request.YoutubeSearchUrl);
        await repository.AddAsync(recipe, cancellationToken); await repository.SaveChangesAsync(cancellationToken);
        return RecipeMapper.Map(recipe);
    }
}
