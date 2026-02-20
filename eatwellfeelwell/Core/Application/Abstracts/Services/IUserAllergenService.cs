namespace Application.Abstracts.Services
{
    public interface IUserAllergenService
    {
        Task<List<string>> GetUserAllergensAsync(string deviceId);
        Task SetUserAllergensAsync(string deviceId, List<string> allergenKeys);
    }
}
