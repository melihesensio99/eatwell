using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using EatWell.Application.Features.DailyLogs.Commands.AddDailyLogItem;
using EatWell.Domain.DailyLogs;
using EatWell.Domain.Users;

namespace EatWell.UnitTests;

public sealed class DailyLogCommandHandlerTests
{
    [Fact]
    public async Task Add_item_creates_daily_log_and_scales_nutrition()
    {
        var repository = new FakeDailyLogRepository();
        var handler = new AddDailyLogItemCommandHandler(
            repository, new FakeUserProfileRepository(), new FakeCurrentUser("user-1"));
        var command = CreateCommand(quantityGrams: 200);

        var itemId = await handler.Handle(command, CancellationToken.None);

        var dailyLog = Assert.Single(repository.DailyLogs);
        var item = Assert.Single(dailyLog.Items);
        Assert.Equal(itemId, item.Id);
        Assert.Equal(200, item.QuantityGrams);
        Assert.Equal(330, item.Calories);
        Assert.Equal(62, item.ProteinGrams);
        Assert.Equal("user-1", dailyLog.UserId);
    }

    [Fact]
    public async Task Adding_same_food_and_meal_reuses_the_same_daily_log_item()
    {
        var repository = new FakeDailyLogRepository();
        var handler = new AddDailyLogItemCommandHandler(
            repository, new FakeUserProfileRepository(), new FakeCurrentUser("user-1"));

        var firstId = await handler.Handle(CreateCommand(100), CancellationToken.None);
        var secondId = await handler.Handle(CreateCommand(100), CancellationToken.None);

        var dailyLog = Assert.Single(repository.DailyLogs);
        var item = Assert.Single(dailyLog.Items);
        Assert.Equal(firstId, secondId);
        Assert.Equal(200, item.QuantityGrams);
        Assert.Equal(330, item.Calories);
    }

    private static AddDailyLogItemCommand CreateCommand(decimal quantityGrams) => new(
        "food-1", "Tavuk Göğsü", quantityGrams, "lunch",
        new DateOnly(2026, 9, 17), 165, 31, 0, 3.6m, "Example", "123456");

    private sealed class FakeCurrentUser(string userId) : ICurrentUser
    {
        public string UserId { get; } = userId;
    }

    private sealed class FakeDailyLogRepository : IDailyLogRepository
    {
        public List<DailyLog> DailyLogs { get; } = [];

        public Task<DailyLog?> GetByUserAndDateAsync(
            string userId, DateOnly logDate, CancellationToken cancellationToken) =>
            Task.FromResult(DailyLogs.FirstOrDefault(log =>
                log.UserId == userId && log.LogDate == logDate));

        public Task<IReadOnlyList<DailyLog>> GetHistoryAsync(
            string userId, DateOnly fromDate, DateOnly toDate, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<DailyLog>>(DailyLogs
                .Where(log => log.UserId == userId &&
                              log.LogDate >= fromDate && log.LogDate <= toDate)
                .OrderByDescending(log => log.LogDate)
                .ToArray());

        public Task<DailyLog?> GetByItemIdAsync(
            Guid itemId, CancellationToken cancellationToken) =>
            Task.FromResult(DailyLogs.FirstOrDefault(log =>
                log.Items.Any(item => item.Id == itemId)));

        public Task AddAsync(DailyLog dailyLog, CancellationToken cancellationToken)
        {
            DailyLogs.Add(dailyLog);
            return Task.CompletedTask;
        }

        public Task RemoveAsync(DailyLog dailyLog, CancellationToken cancellationToken)
        {
            DailyLogs.Remove(dailyLog);
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken) =>
            Task.CompletedTask;
    }

    private sealed class FakeUserProfileRepository : IUserProfileRepository
    {
        public Task<UserProfile?> GetByUserIdAsync(string userId, CancellationToken cancellationToken) =>
            Task.FromResult<UserProfile?>(new UserProfile(userId));

        public Task AddAsync(UserProfile profile, CancellationToken cancellationToken) =>
            Task.CompletedTask;

        public Task SaveChangesAsync(CancellationToken cancellationToken) =>
            Task.CompletedTask;
    }
}
