using Application.Abstracts.Services;
using Application.DTOs;
using Application.Helpers;
using AutoMapper;

namespace Infrastructure.Services
{
    public class FoodCalorieInfoService : IFoodCalorieInfoService
    {
        private readonly IProductService _productService;
        private readonly IMapper _mapper;

        public FoodCalorieInfoService(IProductService productService, IMapper mapper)
        {
            _productService = productService;
            _mapper = mapper;
        }

        public async Task<FoodCalorieInfoDto> GetCalorieInfo(string barcode)
        {
            var product = await _productService.GetAndifExistSaveProductAsync(barcode);
            var result = _mapper.Map<FoodCalorieInfoDto>(product);
          result.CaloriePercentInfo = CalculateCaloriePercent.GetBreakdown(product);

            return result;
        }
    }
}
