using Application.Abstracts.Services;
using Application.DTOs;
using Application.DTOs.Track;
using Application.Repositories;
using AutoMapper;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class DailyLogService : IDailyLogService
    {
        private readonly IDailyLogRepository _logRepository;
        private readonly IFoodCalorieInfoService _calorieInfoService;
        private readonly IMapper _mapper;

        public DailyLogService(IDailyLogRepository logRepository, IFoodCalorieInfoService calorieInfoService, IMapper mapper)
        {
            _logRepository = logRepository;
            _calorieInfoService = calorieInfoService;
            _mapper = mapper;
        }

        public async Task AddConsumptionAsync(AddConsumptionDto consumptionDto)
        {
            var log = _mapper.Map<DailyLog>(consumptionDto);
            log.LogDate = consumptionDto.Date ?? DateTime.UtcNow;

            await _logRepository.AddAsync(log);
            await _logRepository.SaveChangesAsync();

        }

        public async Task<DailySummaryDto> GetDailySummaryAsync(string deviceId, DateTime date)
        {
            var logs = await _logRepository.GetDailyLogsByDateAsync(deviceId, date);

            var summary = new DailySummaryDto
            {
                Date = date,
                ConsumedItems = new List<ConsumedItemDto>()
            };
            foreach (var log in logs)
            {
                var calorieInfos = await _calorieInfoService.GetCalorieInfo(log.Code);

                float ratio = log.Amount / 100f;
                float kcal100 = calorieInfos.EnergyKcal100g ?? 0;
                float protein100 = calorieInfos.Proteins100g ?? 0;
                
                float calories = kcal100 * ratio;
                summary.TotalCalorie += calories;
                summary.TotalProtein += protein100 * ratio;
                summary.TotalFat += (calorieInfos.Fat100g ?? 0) * ratio;
                summary.TotalCarb += (calorieInfos.Carbohydrates100g ?? 0) * ratio;
                summary.ConsumedItems.Add(new ConsumedItemDto
                {
                    Code = log.Code,
                    ProductName = calorieInfos.ProductName,
                    Amount = log.Amount,
                    Calories = calories,
                    Protein = protein100 * ratio,
                    Fat = (calorieInfos.Fat100g ?? 0) * ratio,
                    Carb = (calorieInfos.Carbohydrates100g ?? 0) * ratio
                });
            }
            return summary;
        }
    }


}
