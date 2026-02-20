using Application.DTOs;
using Domain.Entities;

namespace Application.Helpers
{
    public static class CalculateCaloriePercent
    {
        public static CaloriePercentDto GetBreakdown(Product product)
        {
            var totalKcal = product.EnergyKcal100g ?? 0;

            if (totalKcal <= 0)
            {
                return new CaloriePercentDto { EnergyKcal100g = totalKcal };
            }

            double fatCalories = (product.Fat100g ?? 0) * 9;
            double proteinCalories = (product.Proteins100g ?? 0) * 4;
            double carbCalories = (product.Carbohydrates100g ?? 0) * 4;

            return new CaloriePercentDto
            {
                EnergyKcal100g = totalKcal,
                FatPercent = Math.Round(fatCalories / totalKcal * 100, 1),
                ProteinPercent = Math.Round(proteinCalories / totalKcal * 100, 1),
                CarbPercent = Math.Round(carbCalories / totalKcal * 100, 1)
            };
        }
    }
}

