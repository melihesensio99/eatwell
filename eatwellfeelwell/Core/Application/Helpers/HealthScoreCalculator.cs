using Domain.Entities;
using System;
using System.Collections.Generic;

namespace Application.Helpers
{
    public static class HealthScoreCalculator
    {
        // Sabitleri yönetmek için
        private const int MaxScore = 100;
        private const int HealthyThreshold = 70; 
        private const int ModerateThreshold = 50;

        public static int Calculate(Product product)
        {
            double finalScore = 0;

            int novaScore = product.NovaGroup switch
            {
                "1" => 100,
                "2" => 70,
                "3" => 40,
                "4" => 0,
                _ => 50 
            };
            finalScore += novaScore * 0.40;

            double nutrientScore;

            if (!string.IsNullOrEmpty(product.NutritionGrades))
            {
                nutrientScore = product.NutritionGrades.ToLower() switch
                {
                    "a" => 100,
                    "b" => 80,
                    "c" => 60,
                    "d" => 40,
                    "e" => 20,
                    _ => 0
                };
            }
            else
            {
                nutrientScore = CalculateManualNutrientScore(product);
            }

            finalScore += nutrientScore * 0.60;

            return (int)Math.Round(finalScore);
        }

       
        private static double CalculateManualNutrientScore(Product product)
        {
            int score = 0;
            int count = 0;

            void AddScore(string? level)
            {
                count++;
                score += level?.ToLower() switch
                {
                    "low" => 100,      
                    "moderate" => 50,   
                    "high" => 0,       
                    _ => 50             
                };
            }

            AddScore(product.Fat);
            AddScore(product.Salt);
            AddScore(product.SaturatedFat);
            AddScore(product.Sugars);

            return count == 0 ? 0 : (double)score / count;
        }



      
    }
}