using EatWell.Application.Common.Persistence;
using EatWell.Domain.NutritionGoals;
using EatWell.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace EatWell.Persistence.Repositories;

public sealed class NutritionGoalRepository(EatWellDbContext context) : INutritionGoalRepository
{
    public Task<NutritionGoal?> GetByUserIdAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        return context.NutritionGoals.FirstOrDefaultAsync(
            goal => goal.UserId == userId, cancellationToken);
    }

    public Task AddAsync(NutritionGoal goal, CancellationToken cancellationToken)
    {
        return context.NutritionGoals.AddAsync(goal, cancellationToken).AsTask();
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return context.SaveChangesAsync(cancellationToken);
    }
}
