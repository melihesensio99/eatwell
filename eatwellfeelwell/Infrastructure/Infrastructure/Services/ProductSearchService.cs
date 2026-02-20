using Application.Abstracts.Services;
using Application.Abstracts.Services.ExternalServices;
using Application.DTOs.Search;
using Application.Exceptions;

namespace Infrastructure.Services
{
    public class ProductSearchService : IProductSearchService
    {
        private readonly IFoodApiClient _foodApiClient;

        public ProductSearchService(IFoodApiClient foodApiClient)
        {
            _foodApiClient = foodApiClient;
        }

        public async Task<ProductSearchResponseDto> SearchAsync(string query, int page = 1, int pageSize = 20)
        {
            if (string.IsNullOrWhiteSpace(query))
                throw new ValidationException("Arama terimi boş olamaz");

            if (query.Length < 2)
                throw new ValidationException("Arama terimi en az 2 karakter olmalıdır");

            var result = await _foodApiClient.SearchProductsByNameAsync(query, page, pageSize);

            var products = result.Products?
                .Where(p => !string.IsNullOrEmpty(p.ProductName) && !string.IsNullOrEmpty(p.Code))
                .Select(p => new ProductSearchResultDto
                {
                    Code = p.Code!,
                    ProductName = p.ProductName!,
                    Brands = p.Brands,
                    ImageUrl = p.ImageFrontSmallUrl,
                    NutritionGrade = p.NutritionGrades,
                    CaloriesPer100g = p.Nutriments?.EnergyKcal100g,
                })
                .ToList() ?? new List<ProductSearchResultDto>();

            return new ProductSearchResponseDto
            {
                TotalCount = result.Count,
                Page = result.Page,
                PageSize = result.PageSize,
                Products = products,
            };
        }
    }
}
