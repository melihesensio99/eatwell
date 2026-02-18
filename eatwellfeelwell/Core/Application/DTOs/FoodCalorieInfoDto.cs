using Application.Helpers;
using static Application.Helpers.CalculateCaloriePercent;

namespace Application.DTOs
{
    public class FoodCalorieInfoDto
    {
        public string? ProductName { get; set; } 
        public float? Fat100g { get; set; }
        public float? Proteins100g { get; set; }
        public float? Carbohydrates100g { get; set; }
        public float? Sugars100g { get; set; }
        public float? SaturatedFat100g { get; set; }
        public float? Salt100g { get; set; }
        public float? EnergyKcal100g { get; set; } // 100g'daki kalori
        public CaloriePercent? CaloriePercentInfo { get; set; }
       
    }
}
