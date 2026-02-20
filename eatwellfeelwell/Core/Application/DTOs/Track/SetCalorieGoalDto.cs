namespace Application.DTOs.Track
{
    public class SetCalorieGoalDto
    {
        /// <summary>Kilo (kg)</summary>
        public float Weight { get; set; }

        /// <summary>Boy (cm)</summary>
        public float Height { get; set; }

        /// <summary>Yaş</summary>
        public int Age { get; set; }

        /// <summary>"male" veya "female"</summary>
        public string Gender { get; set; } = "male";

        /// <summary>
        /// Aktivite Seviyesi:
        /// 1 = Hareketsiz (Masa başı)
        /// 2 = Hafif aktif (Haftada 1-3 gün)
        /// 3 = Orta aktif (Haftada 3-5 gün)
        /// 4 = Çok aktif (Haftada 6-7 gün)
        /// 5 = Ekstra aktif (Günde 2 idman)
        /// </summary>
        public int ActivityLevel { get; set; }

        /// <summary>
        /// Hedef Tipi:
        /// 0 = Koruma (Maintenance)
        /// 1 = Kas Kazanımı (Bulk, +400 kcal)
        /// 2 = Yağ Yakımı (Cut, -400 kcal)
        /// </summary>
        public int GoalType { get; set; }
    }
}
