using EatWell.Domain.Users;

namespace EatWell.Application.Common.Persistence;

public interface IUserAllergenRepository
{
    Task<IReadOnlyList<string>> GetTagsByUserIdAsync(string userId, CancellationToken cancellationToken);
    Task ReplaceAsync(string userId, IReadOnlyCollection<string> tags, CancellationToken cancellationToken);
}
