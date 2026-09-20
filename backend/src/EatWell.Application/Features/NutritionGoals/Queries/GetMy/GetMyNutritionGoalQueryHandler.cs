using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Nutrition;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.NutritionGoals.Queries.GetMy;

public sealed class GetMyNutritionGoalQueryHandler(
    INutritionGoalRepository nutritionGoalRepository,
    ICurrentUser currentUser)
    : IRequestHandler<GetMyNutritionGoalQuery, NutritionGoalDto?>
{
    public async Task<NutritionGoalDto?> Handle(
        GetMyNutritionGoalQuery query,
        CancellationToken cancellationToken)
    {
        var goal = await nutritionGoalRepository.GetByUserIdAsync(
            currentUser.UserId, cancellationToken);

        return goal is null
            ? null
            : new NutritionGoalDto(
                goal.UserId,
                goal.DailyCalories,
                goal.ProteinGrams,
                goal.CarbohydratesGrams,
                goal.FatGrams,
                goal.ActivityLevel,
                goal.GoalType,
                goal.TargetWeightKg,
                goal.Source,
                goal.UpdatedAt);
    }
}
