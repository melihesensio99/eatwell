using Application.Abstracts.Services;
using Application.DTOs.Track;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CalorieGoalController : ControllerBase
    {
        private readonly ICalorieGoalService _calorieGoalService;

        public CalorieGoalController(ICalorieGoalService calorieGoalService)
        {
            _calorieGoalService = calorieGoalService;
        }

        [HttpGet]
        public async Task<IActionResult> GetGoal([FromQuery] string deviceId)
        {
            var detail = await _calorieGoalService.GetCalorieGoalDetailAsync(deviceId);
            if (detail == null)
                return Ok(new { hasGoal = false });

            return Ok(new { hasGoal = true, goal = detail });
        }

        [HttpPost]
        public async Task<IActionResult> SetGoal([FromQuery] string deviceId, [FromBody] SetCalorieGoalDto dto)
        {
            var result = await _calorieGoalService.SetCalorieGoalAsync(deviceId, dto);
            return Ok(new 
            { 
                message = "Kalori hedefi hesaplandı ve kaydedildi",
                goal = result 
            });
        }
    }
}

