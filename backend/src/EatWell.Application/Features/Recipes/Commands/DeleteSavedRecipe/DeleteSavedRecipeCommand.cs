using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Recipes;
using MediatR;

namespace EatWell.Application.Features.Recipes.Commands.DeleteSavedRecipe;

public sealed record DeleteSavedRecipeCommand(Guid Id) : IRequest;
public sealed class DeleteSavedRecipeCommandHandler(ISavedRecipeRepository repository, ICurrentUser currentUser) : IRequestHandler<DeleteSavedRecipeCommand>
{
    public async Task Handle(DeleteSavedRecipeCommand request, CancellationToken cancellationToken) { var recipe = await repository.GetAsync(currentUser.UserId, request.Id, cancellationToken); if (recipe is null) return; repository.Remove(recipe); await repository.SaveChangesAsync(cancellationToken); }
}
