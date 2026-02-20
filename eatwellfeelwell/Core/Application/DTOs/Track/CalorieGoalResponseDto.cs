namespace Application.DTOs.Track
{
    public class CalorieGoalResponseDto
    {
        public float BMR { get; set; }
        public float TDEE { get; set; }
        public float DailyCalorieTarget { get; set; }

        // Profil bilgileri
        public float Weight { get; set; }
        public float Height { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public int ActivityLevel { get; set; }
        public int GoalType { get; set; }

        // Etiketler
        public string ActivityLevelLabel { get; set; } = string.Empty;
        public string GoalTypeLabel { get; set; } = string.Empty;
    }
}
