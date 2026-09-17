using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Nutrition;
using EatWell.Application.Common.Persistence;
using EatWell.Domain.NutritionGoals;
using FluentValidation;
using MediatR;

namespace EatWell.Application.Features.NutritionGoals.Commands.CalculateWithAi;

public sealed class CalculateNutritionGoalWithAiCommandHandler(
    IUserProfileRepository userProfileRepository,
    INutritionGoalRepository nutritionGoalRepository,
    INutritionGoalProvider nutritionGoalProvider,
    IValidator<NutritionGoalCalculationDto> calculationValidator,
    ICurrentUser currentUser)
    : IRequestHandler<CalculateNutritionGoalWithAiCommand, NutritionGoalCalculationDto>
{
    public async Task<NutritionGoalCalculationDto> Handle(
        CalculateNutritionGoalWithAiCommand command,
        CancellationToken cancellationToken)
    {
        var profile = await userProfileRepository.GetByUserIdAsync(
            currentUser.UserId, cancellationToken);

        if (profile?.WeightKg is null || profile.HeightCm is null ||
            profile.BirthDate is null || string.IsNullOrWhiteSpace(profile.Gender))
        {
            throw new InvalidOperationException(
                "AI hedef hesaplamak için profil bilgileri eksik.");
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var age = today.Year - profile.BirthDate.Value.Year;
        if (profile.BirthDate.Value > today.AddYears(-age))
            age--;

        var result = await nutritionGoalProvider.CalculateAsync(
            new NutritionGoalInputDto(
                profile.Gender,
                age,
                profile.WeightKg.Value,
                profile.HeightCm.Value,
                command.ActivityLevel,
                command.Goal,
                command.TargetWeightKg),
            cancellationToken);
        await calculationValidator.ValidateAndThrowAsync(result, cancellationToken);

        var nutritionGoal = await nutritionGoalRepository.GetByUserIdAsync(
            currentUser.UserId, cancellationToken);
        if (nutritionGoal is null)
        {
            nutritionGoal = new NutritionGoal(currentUser.UserId);
            await nutritionGoalRepository.AddAsync(nutritionGoal, cancellationToken);
        }

        nutritionGoal.SetFromAi(
            result.DailyCalories,
            result.ProteinGrams,
            result.CarbohydratesGrams,
            result.FatGrams);
        await nutritionGoalRepository.SaveChangesAsync(cancellationToken);

        return result;
    }
}
