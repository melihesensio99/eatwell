namespace Domain.Entities
{
    public class CalorieGoal
    {
        public int Id { get; set; }
        public string DeviceId { get; set; } = string.Empty;
        public float Weight { get; set; }      
        public float Height { get; set; }      
        public int Age { get; set; }
        public string Gender { get; set; } = "male";  
        public int ActivityLevel { get; set; } 
        public int GoalType { get; set; }       // 0=Koruma, 1=Kas Kazanımı, 2=Yağ Yakımı
        public float BMR { get; set; }
        public float TDEE { get; set; }
        public float DailyCalorieTarget { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
