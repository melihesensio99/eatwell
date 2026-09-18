using EatWell.Application.Common.Recipes;
using EatWell.Domain.Recipes;
using EatWell.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace EatWell.Persistence.Repositories;

public sealed class SavedRecipeRepository(EatWellDbContext context) : ISavedRecipeRepository
{
    public async Task<IReadOnlyList<SavedRecipe>> GetByUserIdAsync(string userId, CancellationToken cancellationToken) => await context.SavedRecipes.AsNoTracking().Where(recipe => recipe.UserId == userId).OrderByDescending(recipe => recipe.CreatedAt).ToListAsync(cancellationToken);
    public Task AddAsync(SavedRecipe recipe, CancellationToken cancellationToken) => context.SavedRecipes.AddAsync(recipe, cancellationToken).AsTask();
    public Task<SavedRecipe?> GetAsync(string userId, Guid id, CancellationToken cancellationToken) => context.SavedRecipes.FirstOrDefaultAsync(recipe => recipe.UserId == userId && recipe.Id == id, cancellationToken);
    public void Remove(SavedRecipe recipe) => context.SavedRecipes.Remove(recipe);
    public Task SaveChangesAsync(CancellationToken cancellationToken) => context.SaveChangesAsync(cancellationToken);
}
