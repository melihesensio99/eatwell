using Application.DTOs.ExternalDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Abstracts.Services.ExternalServices
{
    public interface IFoodApiClient
    {
        Task<OpenFoodResponseDto> GetProductByBarcode(string barcode);
        Task<OpenFoodSearchResponseDto> SearchProductsByNameAsync(string query, int page = 1, int pageSize = 20);
    }
}
