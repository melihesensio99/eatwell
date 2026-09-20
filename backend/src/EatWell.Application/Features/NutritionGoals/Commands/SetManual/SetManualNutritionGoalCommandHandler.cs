using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using EatWell.Domain.NutritionGoals;
using MediatR;

namespace EatWell.Application.Features.NutritionGoals.Commands.SetManual;

public sealed class SetManualNutritionGoalCommandHandler(
    IUserProfileRepository userProfileRepository,
    INutritionGoalRepository nutritionGoalRepository,
    ICurrentUser currentUser) : IRequestHandler<SetManualNutritionGoalCommand>
{
    public async Task Handle(SetManualNutritionGoalCommand command, CancellationToken cancellationToken)
    {
        var profile = await userProfileRepository.GetByUserIdAsync(
            currentUser.UserId, cancellationToken);
        if (profile is null)
            throw new InvalidOperationException("Önce kullanıcı profili oluşturulmalıdır.");

        var goal = await nutritionGoalRepository.GetByUserIdAsync(
            currentUser.UserId, cancellationToken);
        if (goal is null)
        {
            goal = new NutritionGoal(currentUser.UserId);
            await nutritionGoalRepository.AddAsync(goal, cancellationToken);
        }

        goal.SetManual(
            command.DailyCalories,
            command.ProteinGrams,
            command.CarbohydratesGrams,
            command.FatGrams);
        profile.SetWaterGoal(command.WaterGoalMilliliters);
        await nutritionGoalRepository.SaveChangesAsync(cancellationToken);
    }
}
