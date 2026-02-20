using Application.DTOs.Search;

namespace Application.Abstracts.Services
{
    public interface IProductSearchService
    {
        Task<ProductSearchResponseDto> SearchAsync(string query, int page = 1, int pageSize = 20);
    }
}
