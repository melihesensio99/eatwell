using EatWell.Application.Common.Persistence;
using EatWell.Domain.Users;
using EatWell.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace EatWell.Persistence.Repositories;

public sealed class UserAllergenRepository(EatWellDbContext context) : IUserAllergenRepository
{
    public async Task<IReadOnlyList<string>> GetTagsByUserIdAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        return await context.UserAllergens
            .Where(allergen => allergen.UserId == userId)
            .Select(allergen => allergen.AllergenTag)
            .ToListAsync(cancellationToken);
    }

    public async Task ReplaceAsync(
        string userId,
        IReadOnlyCollection<string> tags,
        CancellationToken cancellationToken)
    {
        var existing = await context.UserAllergens
            .Where(allergen => allergen.UserId == userId)
            .ToListAsync(cancellationToken);

        context.UserAllergens.RemoveRange(existing);
        await context.UserAllergens.AddRangeAsync(
            tags.Select(tag => new UserAllergen(userId, tag)), cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }
}
