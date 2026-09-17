using EatWell.Domain.Users;

namespace EatWell.Application.Common.Persistence;

public interface IFavoriteFoodRepository
{
    Task<IReadOnlyList<FavoriteFood>> GetFavoritesAsync(string userId, CancellationToken cancellationToken);
    Task<bool> ExistsAsync(string userId, string foodExternalId, CancellationToken cancellationToken);
    Task AddAsync(FavoriteFood favoriteFood, CancellationToken cancellationToken);
    Task RemoveAsync(string userId, string foodExternalId, CancellationToken cancellationToken);
    Task<IReadOnlyList<FavoriteFood>> GetRecentAsync(string userId, int limit, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
