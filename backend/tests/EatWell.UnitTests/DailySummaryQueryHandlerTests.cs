using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using EatWell.Application.Features.DailyLogs.Queries.GetDailySummary;
using EatWell.Domain.DailyLogs;
using EatWell.Domain.NutritionGoals;

namespace EatWell.UnitTests;

public sealed class DailySummaryQueryHandlerTests
{
    private static readonly DateOnly LogDate = new(2026, 9, 17);

    [Fact]
    public async Task Summary_calculates_consumed_remaining_and_percentage()
    {
        var dailyLog = new DailyLog("user-1", LogDate);
        dailyLog.AddItem("food-1", "Tavuk", 200, "lunch", 330, 62, 0, 7.2m);

        var goal = new NutritionGoal("user-1");
        goal.SetManual(2200, 165, 220, 73);

        var handler = CreateHandler(dailyLog, goal);

        var result = await handler.Handle(
            new GetDailySummaryQuery(LogDate), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(330, result.ConsumedCalories);
        Assert.Equal(2200, result.TargetCalories);
        Assert.Equal(1870, result.RemainingCalories);
        Assert.Equal(15, result.CalorieCompletionPercentage);
        Assert.Equal(62, result.ConsumedProteinGrams);
        Assert.Equal(103, result.RemainingProteinGrams);
    }

    [Fact]
    public async Task Summary_returns_zero_consumption_when_daily_log_does_not_exist()
    {
        var goal = new NutritionGoal("user-1");
        goal.SetManual(2200, 165, 220, 73);
        var handler = CreateHandler(null, goal);

        var result = await handler.Handle(
            new GetDailySummaryQuery(LogDate), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(0, result.ConsumedCalories);
        Assert.Equal(2200, result.TargetCalories);
        Assert.Equal(0, result.CalorieCompletionPercentage);
    }

    [Fact]
    public async Task Summary_returns_null_targets_when_goal_does_not_exist()
    {
        var dailyLog = new DailyLog("user-1", LogDate);
        dailyLog.AddItem("food-1", "Tavuk", 100, "lunch", 165, 31, 0, 3.6m);
        var handler = CreateHandler(dailyLog, null);

        var result = await handler.Handle(
            new GetDailySummaryQuery(LogDate), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(165, result.ConsumedCalories);
        Assert.Null(result.TargetCalories);
        Assert.Null(result.RemainingCalories);
        Assert.Null(result.CalorieCompletionPercentage);
    }

    private static GetDailySummaryQueryHandler CreateHandler(
        DailyLog? dailyLog,
        NutritionGoal? goal)
    {
        return new GetDailySummaryQueryHandler(
            new FakeDailyLogRepository(dailyLog),
            new FakeNutritionGoalRepository(goal),
            new FakeCurrentUser("user-1"));
    }

    private sealed class FakeCurrentUser(string userId) : ICurrentUser
    {
        public string UserId { get; } = userId;
    }

    private sealed class FakeDailyLogRepository(DailyLog? dailyLog) : IDailyLogRepository
    {
        public Task<DailyLog?> GetByUserAndDateAsync(
            string userId, DateOnly logDate, CancellationToken cancellationToken) =>
            Task.FromResult(dailyLog?.UserId == userId && dailyLog.LogDate == logDate
                ? dailyLog
                : null);

        public Task<IReadOnlyList<DailyLog>> GetHistoryAsync(
            string userId, DateOnly fromDate, DateOnly toDate, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<DailyLog>>([]);

        public Task<DailyLog?> GetByItemIdAsync(Guid itemId, CancellationToken cancellationToken) =>
            Task.FromResult<DailyLog?>(null);

        public Task AddAsync(DailyLog dailyLog, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task RemoveAsync(DailyLog dailyLog, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class FakeNutritionGoalRepository(NutritionGoal? goal) : INutritionGoalRepository
    {
        public Task<NutritionGoal?> GetByUserIdAsync(string userId, CancellationToken cancellationToken) =>
            Task.FromResult(goal?.UserId == userId ? goal : null);

        public Task AddAsync(NutritionGoal goal, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
