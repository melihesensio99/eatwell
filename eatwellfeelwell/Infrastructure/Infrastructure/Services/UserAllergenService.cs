using Application.Abstracts.Services;
using Application.Repositories;
using Domain.Entities;

namespace Infrastructure.Services
{
    public class UserAllergenService : IUserAllergenService
    {
        private readonly IUserAllergenRepository _repository;

        public UserAllergenService(IUserAllergenRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<string>> GetUserAllergensAsync(string deviceId)
        {
            var allergens = await _repository.GetByDeviceIdAsync(deviceId);
            return allergens.Select(a => a.AllergenKey).ToList();
        }

        public async Task SetUserAllergensAsync(string deviceId, List<string> allergenKeys)
        {
            
            await _repository.DeleteByDeviceIdAsync(deviceId);

            var allergens = allergenKeys.Select(key => new UserAllergen
            {
                DeviceId = deviceId,
                AllergenKey = key
            }).ToList();

            await _repository.AddRangeAsync(allergens);
            await _repository.SaveChangesAsync();
        }
    }
}
