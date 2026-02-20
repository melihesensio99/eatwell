using Application.DTOs.Track;

namespace Application.Abstracts.Services
{
    public interface ICalorieGoalService
    {
        Task<float?> GetCalorieGoalAsync(string deviceId);
        Task<CalorieGoalResponseDto?> GetCalorieGoalDetailAsync(string deviceId);
        Task<CalorieGoalResponseDto> SetCalorieGoalAsync(string deviceId, SetCalorieGoalDto dto);
    }
}
