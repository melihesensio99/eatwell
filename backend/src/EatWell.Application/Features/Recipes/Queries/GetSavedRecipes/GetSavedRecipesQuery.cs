using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Recipes;
using EatWell.Application.Features.Recipes.Common;
using MediatR;

namespace EatWell.Application.Features.Recipes.Queries.GetSavedRecipes;

public sealed record GetSavedRecipesQuery : IRequest<IReadOnlyList<SavedRecipeDto>>;
public sealed class GetSavedRecipesQueryHandler(ISavedRecipeRepository repository, ICurrentUser currentUser) : IRequestHandler<GetSavedRecipesQuery, IReadOnlyList<SavedRecipeDto>>
{
    public async Task<IReadOnlyList<SavedRecipeDto>> Handle(GetSavedRecipesQuery request, CancellationToken cancellationToken) => (await repository.GetByUserIdAsync(currentUser.UserId, cancellationToken)).Select(RecipeMapper.Map).ToArray();
}
