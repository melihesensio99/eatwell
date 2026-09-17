using EatWell.Application.Common.Persistence;
using EatWell.Domain.DailyLogs;
using EatWell.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace EatWell.Persistence.Repositories;

public sealed class DailyLogRepository(EatWellDbContext context) : IDailyLogRepository
{
    public Task<DailyLog?> GetByUserAndDateAsync(
        string userId,
        DateOnly logDate,
        CancellationToken cancellationToken)
    {
        return context.DailyLogs
            .Include(log => log.Items)
            .FirstOrDefaultAsync(
                log => log.UserId == userId && log.LogDate == logDate,
                cancellationToken);
    }

    public async Task<IReadOnlyList<DailyLog>> GetHistoryAsync(
        string userId,
        DateOnly fromDate,
        DateOnly toDate,
        CancellationToken cancellationToken)
    {
        return await context.DailyLogs
            .AsNoTracking()
            .Include(log => log.Items)
            .Where(log => log.UserId == userId &&
                         log.LogDate >= fromDate &&
                         log.LogDate <= toDate)
            .OrderByDescending(log => log.LogDate)
            .ToListAsync(cancellationToken);
    }

    public Task<DailyLog?> GetByItemIdAsync(
        Guid itemId,
        CancellationToken cancellationToken)
    {
        return context.DailyLogs
            .Include(log => log.Items)
            .FirstOrDefaultAsync(
                log => log.Items.Any(item => item.Id == itemId),
                cancellationToken);
    }

    public Task AddAsync(DailyLog dailyLog, CancellationToken cancellationToken)
    {
        return context.DailyLogs.AddAsync(dailyLog, cancellationToken).AsTask();
    }

    public Task RemoveAsync(DailyLog dailyLog, CancellationToken cancellationToken)
    {
        context.DailyLogs.Remove(dailyLog);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return context.SaveChangesAsync(cancellationToken);
    }
}
