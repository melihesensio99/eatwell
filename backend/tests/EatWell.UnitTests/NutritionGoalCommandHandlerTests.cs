using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Nutrition;
using EatWell.Application.Common.Persistence;
using EatWell.Application.Features.NutritionGoals.Commands.CalculateWithAi;
using EatWell.Application.Features.NutritionGoals.Commands.SetManual;
using EatWell.Domain.NutritionGoals;
using EatWell.Domain.Users;
using FluentValidation;

namespace EatWell.UnitTests;

public sealed class NutritionGoalCommandHandlerTests
{
    [Fact]
    public async Task Manual_goal_is_saved_with_manual_source()
    {
        var goals = new FakeNutritionGoalRepository();
        var handler = new SetManualNutritionGoalCommandHandler(
            new FakeUserProfileRepository(true), goals, new FakeCurrentUser("user-1"));

        await handler.Handle(new SetManualNutritionGoalCommand(2200, 165, 220, 73), CancellationToken.None);

        Assert.NotNull(goals.Goal);
        var goal = goals.Goal!;
        Assert.Equal(2200, goal.DailyCalories);
        Assert.Equal(NutritionGoalSource.Manual, goal.Source);
    }

    [Fact]
    public async Task Ai_goal_is_saved_with_ai_source()
    {
        var goals = new FakeNutritionGoalRepository();
        var provider = new FakeNutritionGoalProvider();
        var handler = new CalculateNutritionGoalWithAiCommandHandler(
            new FakeUserProfileRepository(true),
            goals,
            provider,
            new NutritionGoalCalculationValidator(),
            new FakeCurrentUser("user-1"));

        var result = await handler.Handle(
            new CalculateNutritionGoalWithAiCommand("moderate", "maintain_weight", null),
            CancellationToken.None);

        Assert.Equal(2200, result.DailyCalories);
        Assert.NotNull(goals.Goal);
        Assert.Equal(NutritionGoalSource.Ai, goals.Goal.Source);
    }

    [Fact]
    public async Task Ai_goal_requires_a_profile()
    {
        var handler = new CalculateNutritionGoalWithAiCommandHandler(
            new FakeUserProfileRepository(false),
            new FakeNutritionGoalRepository(),
            new FakeNutritionGoalProvider(),
            new NutritionGoalCalculationValidator(),
            new FakeCurrentUser("user-1"));

        await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(
            new CalculateNutritionGoalWithAiCommand("moderate", "maintain_weight", null),
            CancellationToken.None));
    }

    private sealed class FakeCurrentUser(string userId) : ICurrentUser
    {
        public string UserId { get; } = userId;
    }

    private sealed class FakeUserProfileRepository(bool exists) : IUserProfileRepository
    {
        public Task<UserProfile?> GetByUserIdAsync(string userId, CancellationToken cancellationToken)
        {
            if (!exists)
                return Task.FromResult<UserProfile?>(null);

            var profile = new UserProfile(userId);
            profile.Update("Test", 80, 180, "male", new DateOnly(1995, 1, 1));
            return Task.FromResult<UserProfile?>(profile);
        }

        public Task AddAsync(UserProfile profile, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class FakeNutritionGoalRepository : INutritionGoalRepository
    {
        public NutritionGoal? Goal { get; private set; }

        public Task<NutritionGoal?> GetByUserIdAsync(string userId, CancellationToken cancellationToken) =>
            Task.FromResult(Goal);

        public Task AddAsync(NutritionGoal goal, CancellationToken cancellationToken)
        {
            Goal = goal;
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class FakeNutritionGoalProvider : INutritionGoalProvider
    {
        public Task<NutritionGoalCalculationDto> CalculateAsync(
            NutritionGoalInputDto input,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(new NutritionGoalCalculationDto(
                2200, 165, 220, 73, 1800, 2200, 0, [], []));
    }
}
