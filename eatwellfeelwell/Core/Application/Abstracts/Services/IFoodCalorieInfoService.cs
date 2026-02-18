using Application.DTOs;

namespace Application.Abstracts.Services
{
    public interface IFoodCalorieInfoService
    {
        Task<FoodCalorieInfoDto> GetCalorieInfo(string barcode);
    }
}
