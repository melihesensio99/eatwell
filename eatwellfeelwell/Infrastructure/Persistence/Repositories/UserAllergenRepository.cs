using Application.Repositories;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Persistence.Contexts;

namespace Persistence.Repositories
{
    public class UserAllergenRepository : IUserAllergenRepository
    {
        private readonly EatWellContext _context;

        public UserAllergenRepository(EatWellContext context)
        {
            _context = context;
        }

        public async Task<List<UserAllergen>> GetByDeviceIdAsync(string deviceId)
        {
            return await _context.UserAllergens
                .Where(ua => ua.DeviceId == deviceId)
                .ToListAsync();
        }

        public async Task AddAsync(UserAllergen allergen)
        {
            await _context.UserAllergens.AddAsync(allergen);
        }

        public async Task AddRangeAsync(List<UserAllergen> allergens)
        {
            await _context.UserAllergens.AddRangeAsync(allergens);
        }

        public async Task DeleteByDeviceIdAsync(string deviceId)
        {
            var existing = await _context.UserAllergens
                .Where(ua => ua.DeviceId == deviceId)
                .ToListAsync();

            _context.UserAllergens.RemoveRange(existing);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
