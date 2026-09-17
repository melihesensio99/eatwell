using EatWell.Domain.DailyLogs;

namespace EatWell.Application.Common.Persistence;

public interface IDailyLogRepository
{
    Task<DailyLog?> GetByUserAndDateAsync(
        string userId,
        DateOnly logDate,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<DailyLog>> GetHistoryAsync(
        string userId,
        DateOnly fromDate,
        DateOnly toDate,
        CancellationToken cancellationToken);

    Task<DailyLog?> GetByItemIdAsync(
        Guid itemId,
        CancellationToken cancellationToken);

    Task AddAsync(DailyLog dailyLog, CancellationToken cancellationToken);
    Task RemoveAsync(DailyLog dailyLog, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
