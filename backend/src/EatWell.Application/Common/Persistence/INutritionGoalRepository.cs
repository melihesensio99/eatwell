using EatWell.Domain.NutritionGoals;

namespace EatWell.Application.Common.Persistence;

public interface INutritionGoalRepository
{
    Task<NutritionGoal?> GetByUserIdAsync(string userId, CancellationToken cancellationToken);
    Task AddAsync(NutritionGoal goal, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
