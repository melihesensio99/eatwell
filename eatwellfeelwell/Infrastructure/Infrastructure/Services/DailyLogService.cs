using Application.Abstracts.Services;
using Application.DTOs;
using Application.DTOs.Track;
using Application.Exceptions;
using Application.Helpers;
using Application.Repositories;
using AutoMapper;
using Domain.Entities;

namespace Infrastructure.Services
{
    public class DailyLogService : IDailyLogService
    {
        private readonly IDailyLogRepository _logRepository;
        private readonly IProductRepository _productRepository;
        private readonly ICalorieGoalService _calorieGoalService;
        private readonly IMapper _mapper;

        public DailyLogService(
            IDailyLogRepository logRepository,
            IProductRepository productRepository,
            ICalorieGoalService calorieGoalService,
            IMapper mapper)
        {
            _logRepository = logRepository;
            _productRepository = productRepository;
            _calorieGoalService = calorieGoalService;
            _mapper = mapper;
        }

        public async Task AddConsumptionAsync(AddConsumptionDto consumptionDto)
        {
            if (string.IsNullOrWhiteSpace(consumptionDto.DeviceId))
                throw new ValidationException("DeviceId boş olamaz");
            if (string.IsNullOrWhiteSpace(consumptionDto.Code))
                throw new ValidationException("Ürün kodu boş olamaz");
            if (consumptionDto.Amount <= 0)
                throw new ValidationException("Miktar sıfırdan büyük olmalıdır");

            var log = _mapper.Map<DailyLog>(consumptionDto);
            log.LogDate = consumptionDto.Date ?? DateTime.UtcNow;

            await _logRepository.AddAsync(log);
            await _logRepository.SaveChangesAsync();
        }

        public async Task<bool> DeleteConsumptionAsync(int logId, string deviceId)
        {
            var log = await _logRepository.GetByIdAsync(logId);
            if (log == null || log.DeviceId != deviceId)
                return false;

            _logRepository.Delete(log);
            await _logRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateConsumptionAmountAsync(int logId, string deviceId, float newAmount)
        {
            var log = await _logRepository.GetByIdAsync(logId);
            if (log == null || log.DeviceId != deviceId)
                return false;

            log.Amount = newAmount;
            await _logRepository.SaveChangesAsync();
            return true;
        }

        public async Task<DailySummaryDto> GetDailySummaryAsync(string deviceId, DateTime date)
        {
            if (string.IsNullOrWhiteSpace(deviceId))
                throw new ArgumentException("DeviceId boş olamaz");

            var logs = await _logRepository.GetDailyLogsByDateAsync(deviceId, date);

            var uniqueCodes = logs.Select(l => l.Code).Distinct().ToList();
            var products = await _productRepository.GetProductsByBarcodesAsync(uniqueCodes);
            var productMap = products.ToDictionary(p => p.Code, p => p);

            var summary = new DailySummaryDto
            {
                Date = date,
                ConsumedItems = new List<ConsumedItemDto>()
            };

            foreach (var log in logs)
            {
                if (!productMap.TryGetValue(log.Code, out var product))
                    continue; // Ürün bilgisi yoksa atla

                float ratio = log.Amount / 100f;
                float kcal100 = product.EnergyKcal100g ?? 0;
                float protein100 = product.Proteins100g ?? 0;

                float calories = kcal100 * ratio;
                summary.TotalCalorie += calories;
                summary.TotalProtein += protein100 * ratio;
                summary.TotalFat += (product.Fat100g ?? 0) * ratio;
                summary.TotalCarb += (product.Carbohydrates100g ?? 0) * ratio;

                summary.ConsumedItems.Add(new ConsumedItemDto
                {
                    Id = log.Id,
                    Code = log.Code,
                    ProductName = product.ProductName,
                    Amount = log.Amount,
                    Calories = calories,
                    Protein = protein100 * ratio,
                    Fat = (product.Fat100g ?? 0) * ratio,
                    Carb = (product.Carbohydrates100g ?? 0) * ratio
                });
            }

        
            var goalValue = await _calorieGoalService.GetCalorieGoalAsync(deviceId);
            if (goalValue.HasValue && goalValue.Value > 0)
            {
                summary.CalorieGoal = goalValue.Value;
                summary.CalorieRemaining = goalValue.Value - summary.TotalCalorie;
                summary.CalorieGoalPercentage = (summary.TotalCalorie / goalValue.Value) * 100f;
            }

            return summary;
        }
    }
}

