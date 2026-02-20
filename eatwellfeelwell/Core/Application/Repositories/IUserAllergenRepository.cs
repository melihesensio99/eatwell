using Domain.Entities;

namespace Application.Repositories
{
    public interface IUserAllergenRepository
    {
        Task<List<UserAllergen>> GetByDeviceIdAsync(string deviceId);
        Task AddAsync(UserAllergen allergen);
        Task AddRangeAsync(List<UserAllergen> allergens);
        Task DeleteByDeviceIdAsync(string deviceId);
        Task SaveChangesAsync();
    }
}
