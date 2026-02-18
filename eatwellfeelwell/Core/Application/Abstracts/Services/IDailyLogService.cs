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

      Task<DailySummaryDto> GetDailySummaryAsync(string deviceId ,DateTime date);
    }
}
