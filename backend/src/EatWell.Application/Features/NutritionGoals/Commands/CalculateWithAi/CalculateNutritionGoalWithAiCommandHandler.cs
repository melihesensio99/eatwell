using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Nutrition;
using EatWell.Application.Common.Persistence;
using FluentValidation;
using MediatR;

namespace EatWell.Application.Features.NutritionGoals.Commands.CalculateWithAi;

public sealed class CalculateNutritionGoalWithAiCommandHandler(
    IUserProfileRepository userProfileRepository,
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
            profile.Age is null || string.IsNullOrWhiteSpace(profile.Gender))
        {
            throw new InvalidOperationException(
                "AI hedef hesaplamak için profil bilgileri eksik.");
        }

        var result = await nutritionGoalProvider.CalculateAsync(
            new NutritionGoalInputDto(
                profile.Gender,
                profile.Age.Value,
                profile.WeightKg.Value,
                profile.HeightCm.Value,
                command.ActivityLevel,
                command.Goal,
                command.TargetWeightKg),
            cancellationToken);
        await calculationValidator.ValidateAndThrowAsync(result, cancellationToken);

        // Water is calculated from the saved profile and is shown with the AI
        // recommendation. It is confirmed together with the other targets.
        result = result with
        {
            WaterGoalMilliliters = Math.Round(profile.WeightKg.Value * 35m)
        };

        // Hesaplama yalnızca öneri üretir. Hedef, kullanıcı onayladığında ayrıca kaydedilir.
        return result;
    }
}
