using Application.DTOs;
using Application.DTOs.Track;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Abstracts.Services
{
    public interface IDailyLogService
    {
        Task AddConsumptionAsync(AddConsumptionDto consumptionDto);
        Task<bool> DeleteConsumptionAsync(int logId, string deviceId);
        Task<bool> UpdateConsumptionAmountAsync(int logId, string deviceId, float newAmount);
        Task<DailySummaryDto> GetDailySummaryAsync(string deviceId, DateTime date);
    }
}
