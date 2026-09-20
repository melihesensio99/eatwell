using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using EatWell.Domain.NutritionGoals;
using MediatR;

namespace EatWell.Application.Features.NutritionGoals.Commands.ConfirmAi;

public sealed class ConfirmAiNutritionGoalCommandHandler(
    IUserProfileRepository userProfileRepository,
    INutritionGoalRepository nutritionGoalRepository,
    ICurrentUser currentUser) : IRequestHandler<ConfirmAiNutritionGoalCommand>
{
    public async Task Handle(ConfirmAiNutritionGoalCommand command, CancellationToken cancellationToken)
    {
        var profile = await userProfileRepository.GetByUserIdAsync(currentUser.UserId, cancellationToken);
        if (profile is null)
            throw new InvalidOperationException("Önce kullanıcı profili oluşturulmalıdır.");

        var goal = await nutritionGoalRepository.GetByUserIdAsync(currentUser.UserId, cancellationToken);
        if (goal is null)
        {
            goal = new NutritionGoal(currentUser.UserId);
            await nutritionGoalRepository.AddAsync(goal, cancellationToken);
        }

        goal.SetFromAi(
            command.DailyCalories,
            command.ProteinGrams,
            command.CarbohydratesGrams,
            command.FatGrams,
            command.ActivityLevel,
            command.Goal,
            command.TargetWeightKg);
        profile.SetWaterGoal(command.WaterGoalMilliliters);
        await nutritionGoalRepository.SaveChangesAsync(cancellationToken);
    }
}
