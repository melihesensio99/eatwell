using EatWell.Domain.Recipes;

namespace EatWell.Application.Common.Recipes;

public interface ISavedRecipeRepository
{
    Task<IReadOnlyList<SavedRecipe>> GetByUserIdAsync(string userId, CancellationToken cancellationToken);
    Task AddAsync(SavedRecipe recipe, CancellationToken cancellationToken);
    Task<SavedRecipe?> GetAsync(string userId, Guid id, CancellationToken cancellationToken);
    void Remove(SavedRecipe recipe);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
