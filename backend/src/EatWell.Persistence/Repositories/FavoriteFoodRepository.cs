using EatWell.Application.Common.Persistence;
using EatWell.Domain.Users;
using EatWell.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace EatWell.Persistence.Repositories;

public sealed class FavoriteFoodRepository(EatWellDbContext context) : IFavoriteFoodRepository
{
    public async Task<IReadOnlyList<FavoriteFood>> GetFavoritesAsync(
        string userId, CancellationToken cancellationToken)
    {
        return await context.FavoriteFoods
            .AsNoTracking()
            .Where(food => food.UserId == userId)
            .OrderByDescending(food => food.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> ExistsAsync(
        string userId, string foodExternalId, CancellationToken cancellationToken)
    {
        return context.FavoriteFoods.AnyAsync(
            food => food.UserId == userId && food.FoodExternalId == foodExternalId,
            cancellationToken);
    }

    public Task AddAsync(FavoriteFood favoriteFood, CancellationToken cancellationToken)
    {
        return context.FavoriteFoods.AddAsync(favoriteFood, cancellationToken).AsTask();
    }

    public async Task RemoveAsync(
        string userId, string foodExternalId, CancellationToken cancellationToken)
    {
        var food = await context.FavoriteFoods.FirstOrDefaultAsync(
            item => item.UserId == userId && item.FoodExternalId == foodExternalId,
            cancellationToken);
        if (food is not null)
            context.FavoriteFoods.Remove(food);
    }

    public async Task<IReadOnlyList<FavoriteFood>> GetRecentAsync(
        string userId, int limit, CancellationToken cancellationToken)
    {
        var items = await context.DailyLogItems
            .AsNoTracking()
            .Where(item => item.DailyLog.UserId == userId)
            .OrderByDescending(item => item.CreatedAt)
            .ToListAsync(cancellationToken);

        return items
            .GroupBy(item => item.FoodExternalId)
            .Select(group => group.First())
            .Take(limit)
            .Select(item => new FavoriteFood(
                userId, item.FoodExternalId, item.FoodName, item.Brand,
                item.Barcode, null, null, null, null, null))
            .ToArray();
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        context.SaveChangesAsync(cancellationToken);
}
