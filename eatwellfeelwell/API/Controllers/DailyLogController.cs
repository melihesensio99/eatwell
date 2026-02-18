using Application.Abstracts.Services;
using Application.DTOs;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DailyLogController : ControllerBase
    {
        private readonly IDailyLogService _dailyLogService;

        public DailyLogController(IDailyLogService dailyLogService)
        {
            _dailyLogService = dailyLogService;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddConsumption([FromBody] AddConsumptionDto request)
        {
            await _dailyLogService.AddConsumptionAsync(request);
            return Ok(new { message = "Consumption added successfully" });
        }

        [HttpGet("summary/{deviceId}")]
        public async Task<IActionResult> GetDailySummary(string deviceId, [FromQuery] DateTime? date = null)
        {
            var summary = await _dailyLogService.GetDailySummaryAsync(deviceId, date ?? DateTime.UtcNow);
            return Ok(summary);
        }
    }
}
