using Application.Abstracts.Services;
using Application.DTOs.Track;
using Application.Exceptions;
using Application.Repositories;
using Domain.Entities;

namespace Infrastructure.Services
{
    public class CalorieGoalService : ICalorieGoalService
    {
        private readonly ICalorieGoalRepository _goalRepository;

        public CalorieGoalService(ICalorieGoalRepository goalRepository)
        {
            _goalRepository = goalRepository;
        }

        public async Task<float?> GetCalorieGoalAsync(string deviceId)
        {
            var goal = await _goalRepository.GetByDeviceIdAsync(deviceId);
            return goal?.DailyCalorieTarget;
        }

        public async Task<CalorieGoalResponseDto?> GetCalorieGoalDetailAsync(string deviceId)
        {
            var goal = await _goalRepository.GetByDeviceIdAsync(deviceId);
            if (goal == null) return null;

            return MapToResponse(goal);
        }

        public async Task<CalorieGoalResponseDto> SetCalorieGoalAsync(string deviceId, SetCalorieGoalDto dto)
        {
            if (string.IsNullOrWhiteSpace(deviceId))
                throw new ValidationException("DeviceId boş olamaz");
            if (dto.Weight <= 0 || dto.Height <= 0 || dto.Age <= 0)
                throw new ValidationException("Kilo, boy ve yaş değerleri sıfırdan büyük olmalıdır");
            if (dto.ActivityLevel < 1 || dto.ActivityLevel > 5)
                throw new ValidationException("Aktivite seviyesi 1-5 arasında olmalıdır");
            if (dto.GoalType < 0 || dto.GoalType > 2)
                throw new ValidationException("Hedef tipi 0-2 arasında olmalıdır");

            float bmr = CalculateBMR(dto.Weight, dto.Height, dto.Age, dto.Gender);

            float tdee = bmr * GetActivityMultiplier(dto.ActivityLevel);

            float dailyTarget = ApplyGoalAdjustment(tdee, dto.GoalType);

            // GÜVENLİK KONTROLÜ: Hedef asla 1000'in altında veya mantıksız (negatif) olamaz
            if (dailyTarget < 1000) dailyTarget = 1200; // Minimum sağlık sınırı

            var existing = await _goalRepository.GetByDeviceIdAsync(deviceId);

            if (existing != null)
            {
                existing.Weight = dto.Weight;
                existing.Height = dto.Height;
                existing.Age = dto.Age;
                existing.Gender = dto.Gender.ToLower();
                existing.ActivityLevel = dto.ActivityLevel;
                existing.GoalType = dto.GoalType;
                existing.BMR = bmr;
                existing.TDEE = tdee;
                existing.DailyCalorieTarget = dailyTarget;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newGoal = new CalorieGoal
                {
                    DeviceId = deviceId,
                    Weight = dto.Weight,
                    Height = dto.Height,
                    Age = dto.Age,
                    Gender = dto.Gender.ToLower(),
                    ActivityLevel = dto.ActivityLevel,
                    GoalType = dto.GoalType,
                    BMR = bmr,
                    TDEE = tdee,
                    DailyCalorieTarget = dailyTarget,
                    UpdatedAt = DateTime.UtcNow,
                };
                await _goalRepository.AddAsync(newGoal);
                existing = newGoal; // IMPORTANT: Initialize existing for return
            }

            await _goalRepository.SaveChangesAsync();
            return MapToResponse(existing);
        }

       
        // Mifflin-St Jeor Formülü
        // Erkek: (10 × kilo) + (6.25 × boy) − (5 × yaş) + 5
        // Kadın: (10 × kilo) + (6.25 × boy) − (5 × yaş) − 161
        
        private static float CalculateBMR(float weightKg, float heightCm, int age, string gender)
        {
            // Eğer yaş yerine doğum yılı girildiyse (örn: 1990), yaşa çevir
            if (age > 1000) 
            {
                 age = DateTime.Now.Year - age;
            }

            float bmr = (10 * weightKg) + (6.25f * heightCm) - (5 * age);
            return gender.ToLower() == "female" ? bmr - 161 : bmr + 5;
        }

        // ============================================================
        // Aktivite Çarpanları
        // 1 = Hareketsiz (1.2)
        // 2 = Hafif aktif (1.375)
        // 3 = Orta aktif (1.55)
        // 4 = Çok aktif (1.725)
        // 5 = Ekstra aktif (1.9)
        // ============================================================
        private static float GetActivityMultiplier(int level) => level switch
        {
            1 => 1.2f,
            2 => 1.375f,
            3 => 1.55f,
            4 => 1.725f,
            5 => 1.9f,
            _ => 1.2f,
        };


        // Hedef Ayarı
        // 0 = Koruma (TDEE)
        // 1 = Kas Kazanımı (+400 kcal)
        // 2 = Yağ Yakımı (-400 kcal)
        private static float ApplyGoalAdjustment(float tdee, int goalType) => goalType switch
        {
            1 => tdee + 400,
            2 => tdee - 400,
            _ => tdee,
        };

        private static string GetActivityLabel(int level) => level switch
        {
            1 => "Hareketsiz (Masa başı)",
            2 => "Hafif aktif (Haftada 1-3 gün)",
            3 => "Orta aktif (Haftada 3-5 gün)",
            4 => "Çok aktif (Haftada 6-7 gün)",
            5 => "Ekstra aktif (Günde 2 idman)",
            _ => "Bilinmiyor",
        };

        private static string GetGoalLabel(int goalType) => goalType switch
        {
            0 => "Koruma (Maintenance)",
            1 => "Kas Kazanımı (Bulk, +400 kcal)",
            2 => "Yağ Yakımı (Cut, -400 kcal)",
            _ => "Koruma",
        };

        private static CalorieGoalResponseDto MapToResponse(CalorieGoal goal)
        {
            return new CalorieGoalResponseDto
            {
                BMR = goal.BMR,
                TDEE = goal.TDEE,
                DailyCalorieTarget = goal.DailyCalorieTarget,
                Weight = goal.Weight,
                Height = goal.Height,
                Age = goal.Age,
                Gender = goal.Gender,
                ActivityLevel = goal.ActivityLevel,
                GoalType = goal.GoalType,
                ActivityLevelLabel = GetActivityLabel(goal.ActivityLevel),
                GoalTypeLabel = GetGoalLabel(goal.GoalType),
            };
        }
    }
}
