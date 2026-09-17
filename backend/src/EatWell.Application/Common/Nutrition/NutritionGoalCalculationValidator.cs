using FluentValidation;

namespace EatWell.Application.Common.Nutrition;

public sealed class NutritionGoalCalculationValidator
    : AbstractValidator<NutritionGoalCalculationDto>
{
    public NutritionGoalCalculationValidator()
    {
        RuleFor(result => result.DailyCalories).InclusiveBetween(800, 6000);
        RuleFor(result => result.ProteinGrams).InclusiveBetween(0, 500);
        RuleFor(result => result.CarbohydratesGrams).InclusiveBetween(0, 1000);
        RuleFor(result => result.FatGrams).InclusiveBetween(0, 300);
        RuleFor(result => result.Bmr).GreaterThan(0).LessThanOrEqualTo(6000);
        RuleFor(result => result.Tdee)
            .GreaterThan(0)
            .GreaterThanOrEqualTo(result => result.Bmr * 0.8m)
            .LessThanOrEqualTo(8000);
        RuleFor(result => result.GoalAdjustmentPercentage)
            .InclusiveBetween(-50, 50);
        RuleFor(result => result)
            .Must(HaveConsistentMacroCalories)
            .WithMessage("Makro kalorileri günlük kalori hedefiyle uyumlu değil.");
    }

    private static bool HaveConsistentMacroCalories(NutritionGoalCalculationDto result)
    {
        var macroCalories =
            result.ProteinGrams * 4m +
            result.CarbohydratesGrams * 4m +
            result.FatGrams * 9m;

        var difference = Math.Abs(macroCalories - result.DailyCalories);
        return difference <= result.DailyCalories * 0.20m;
    }
}
