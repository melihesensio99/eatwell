using Domain.Entities;

namespace Application.Repositories
{
    public interface ICalorieGoalRepository
    {
        Task<CalorieGoal?> GetByDeviceIdAsync(string deviceId);
        Task AddAsync(CalorieGoal goal);
        Task SaveChangesAsync();
    }
}
