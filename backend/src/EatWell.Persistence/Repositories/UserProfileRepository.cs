using EatWell.Application.Common.Persistence;
using EatWell.Domain.Users;
using EatWell.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace EatWell.Persistence.Repositories;

public sealed class UserProfileRepository : IUserProfileRepository
{
    private readonly EatWellDbContext _context;

    public UserProfileRepository(EatWellDbContext context)
    {
        _context = context;
    }

    public Task<UserProfile?> GetByUserIdAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        return _context.UserProfiles
            .FirstOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);
    }

    public async Task AddAsync(UserProfile profile, CancellationToken cancellationToken)
    {
        await _context.UserProfiles.AddAsync(profile, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }
}
