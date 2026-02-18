using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Repositories
{
    public interface IDailyLogRepository
    {
        Task<List<DailyLog>> GetDailyLogsByDateAsync(string deviceId, DateTime date);
        Task AddAsync(DailyLog dailyLog);
        Task SaveChangesAsync();
    }
}
