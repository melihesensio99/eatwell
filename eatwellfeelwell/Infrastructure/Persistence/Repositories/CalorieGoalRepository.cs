using Application.Repositories;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Persistence.Contexts;

namespace Persistence.Repositories
{
    public class CalorieGoalRepository : ICalorieGoalRepository
    {
        private readonly EatWellContext _context;

        public CalorieGoalRepository(EatWellContext context)
        {
            _context = context;
        }

        public async Task<CalorieGoal?> GetByDeviceIdAsync(string deviceId)
        {
            return await _context.Set<CalorieGoal>()
                .FirstOrDefaultAsync(g => g.DeviceId == deviceId);
        }

        public async Task AddAsync(CalorieGoal goal)
        {
            await _context.Set<CalorieGoal>().AddAsync(goal);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
