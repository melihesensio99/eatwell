using Application.Repositories;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Persistence.Repositories
{
    public class DailyLogRepository : IDailyLogRepository
    {
        private readonly EatWellContext _context;

        public DailyLogRepository(EatWellContext context)
        {
            _context = context;
        }

        public async Task<DailyLog?> GetByIdAsync(int id)
        {
            return await _context.Set<DailyLog>().FindAsync(id);
        }

        public async Task AddAsync(DailyLog dailyLog)
        {
            await _context.Set<DailyLog>().AddAsync(dailyLog);
        }

        public void Delete(DailyLog dailyLog)
        {
            _context.Set<DailyLog>().Remove(dailyLog);
        }

        public async Task<List<DailyLog>> GetDailyLogsByDateAsync(string deviceId, DateTime date)
        {
            return await _context.Set<DailyLog>().Where(dl => dl.DeviceId == deviceId && dl.LogDate.Date == date.Date).ToListAsync();

        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
