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
        private readonly HttpClient _httpClient;

        public FoodApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
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
    }
}
