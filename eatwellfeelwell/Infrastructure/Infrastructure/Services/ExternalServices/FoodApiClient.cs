using Application.Abstracts.Services.ExternalServices;
using Application.DTOs.ExternalDtos;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Services.ExternalServices
{
    public class FoodApiClient : IFoodApiClient
    {
        private const string ApiUrl = "https://world.openfoodfacts.org/api/v0";
        private const string SearchApiUrl = "https://world.openfoodfacts.org/cgi/search.pl";
        private readonly HttpClient _httpClient;

        public FoodApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("EatWellFeelWell/1.0");
        }

        public async Task<OpenFoodResponseDto> GetProductByBarcode(string barcode)
        {
            var requestUri = $"{ApiUrl}/product/{barcode}.json";
            var response = await _httpClient.GetAsync(requestUri);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Failed to fetch product by code: {barcode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            var product = JsonConvert.DeserializeObject<OpenFoodResponseDto>(content);

            return product;
        }

        public async Task<OpenFoodSearchResponseDto> SearchProductsByNameAsync(string query, int page = 1, int pageSize = 20)
        {
            var encodedQuery = Uri.EscapeDataString(query);
            // V1 Search API: Using unique_scans_n to ensure popular items (like Nutella) appear first
            var requestUri = $"{SearchApiUrl}?search_terms={encodedQuery}&search_simple=1&action=process&json=1&page={page}&page_size={pageSize}&sort_by=unique_scans_n&fields=code,product_name,brands,image_front_small_url,nutrition_grades,nova_group,nutriments";

            var response = await _httpClient.GetAsync(requestUri);

            if (!response.IsSuccessStatusCode)
            {
                 // Throw exception so caller catch block runs and keeps previous results
                 throw new HttpRequestException($"Search failed: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<OpenFoodSearchResponseDto>(content);

            if (result != null && result.Products != null)
            {
                result.Products = result.Products
                    .Where(p => !string.IsNullOrEmpty(p.ProductName) && 
                                p.ProductName.Contains(query, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            return result ?? new OpenFoodSearchResponseDto();
        }
    }
}
