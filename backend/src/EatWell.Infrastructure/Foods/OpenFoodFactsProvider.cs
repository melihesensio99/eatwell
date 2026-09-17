using System.Net.Http.Json;
using System.Text.Json.Serialization;
using EatWell.Application.Common.Foods;
using EatWell.Application.Common.Exceptions;

namespace EatWell.Infrastructure.Foods;

public sealed class OpenFoodFactsProvider(HttpClient httpClient) : IFoodProvider
{
    private const string Fields = "code,product_name,product_name_tr,brands,image_url,nutriments,nutrition_grades,nova_group,ingredients_text,allergens_tags";

    public async Task<IReadOnlyList<FoodSearchResultDto>> SearchAsync(
        string query,
        CancellationToken cancellationToken = default)
    {
        var url = $"api/v2/search?search_terms={Uri.EscapeDataString(query)}&page_size=20&fields={Fields}";
        SearchResponse? response;
        try
        {
            response = await httpClient.GetFromJsonAsync<SearchResponse>(url, cancellationToken);
        }
        catch (HttpRequestException exception)
        {
            throw new ExternalServiceException("OpenFoodFacts", exception);
        }
        catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            throw new ExternalServiceException("OpenFoodFacts", exception);
        }

        return response?.Products?
            .Where(product => !string.IsNullOrWhiteSpace(product.ProductName))
            .Select(ToSearchResult)
            .ToArray() ?? [];
    }

    public async Task<FoodDetailsDto?> GetByBarcodeAsync(
        string barcode,
        CancellationToken cancellationToken = default)
    {
        ProductResponse? response;
        try
        {
            response = await httpClient.GetFromJsonAsync<ProductResponse>(
                $"api/v2/product/{Uri.EscapeDataString(barcode)}.json?fields={Fields}",
                cancellationToken);
        }
        catch (HttpRequestException exception)
        {
            throw new ExternalServiceException("OpenFoodFacts", exception);
        }
        catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            throw new ExternalServiceException("OpenFoodFacts", exception);
        }

        return response?.Status == 1 && response.Product is not null
            ? ToDetails(response.Product)
            : null;
    }

    private static FoodSearchResultDto ToSearchResult(Product product) => new(
        product.Code ?? string.Empty,
        GetName(product),
        product.Brands,
        product.Code,
        product.Nutriments?.EnergyKcal100g,
        product.ImageUrl,
        product.NutriScore,
        product.NovaGroup);

    private static FoodDetailsDto ToDetails(Product product) => new(
        product.Code ?? string.Empty,
        GetName(product),
        product.Brands,
        product.Code,
        product.Nutriments?.EnergyKcal100g,
        product.Nutriments?.Proteins100g,
        product.Nutriments?.Carbohydrates100g,
        product.Nutriments?.Fat100g,
        product.ImageUrl,
        product.NutriScore,
        product.NovaGroup,
        product.IngredientsText,
        product.AllergensTags ?? [],
        product.Nutriments?.Sugars100g,
        product.Nutriments?.SaturatedFat100g,
        product.Nutriments?.Salt100g);

    private static string GetName(Product product) =>
        string.IsNullOrWhiteSpace(product.ProductNameTr)
            ? product.ProductName ?? "Unknown food"
            : product.ProductNameTr;

    private sealed class SearchResponse
    {
        [JsonPropertyName("products")] public List<Product>? Products { get; init; }
    }

    private sealed class ProductResponse
    {
        [JsonPropertyName("status")] public int Status { get; init; }
        [JsonPropertyName("product")] public Product? Product { get; init; }
    }

    private sealed class Product
    {
        [JsonPropertyName("code")] public string? Code { get; init; }
        [JsonPropertyName("product_name")] public string? ProductName { get; init; }
        [JsonPropertyName("product_name_tr")] public string? ProductNameTr { get; init; }
        [JsonPropertyName("brands")] public string? Brands { get; init; }
        [JsonPropertyName("image_url")] public string? ImageUrl { get; init; }
        [JsonPropertyName("nutrition_grades")] public string? NutriScore { get; init; }
        [JsonPropertyName("nova_group")] public int? NovaGroup { get; init; }
        [JsonPropertyName("ingredients_text")] public string? IngredientsText { get; init; }
        [JsonPropertyName("allergens_tags")] public List<string>? AllergensTags { get; init; }
        [JsonPropertyName("nutriments")] public Nutriments? Nutriments { get; init; }
    }

    private sealed class Nutriments
    {
        [JsonPropertyName("energy-kcal_100g")] public decimal? EnergyKcal100g { get; init; }
        [JsonPropertyName("proteins_100g")] public decimal? Proteins100g { get; init; }
        [JsonPropertyName("carbohydrates_100g")] public decimal? Carbohydrates100g { get; init; }
        [JsonPropertyName("fat_100g")] public decimal? Fat100g { get; init; }
        [JsonPropertyName("sugars_100g")] public decimal? Sugars100g { get; init; }
        [JsonPropertyName("saturated-fat_100g")] public decimal? SaturatedFat100g { get; init; }
        [JsonPropertyName("salt_100g")] public decimal? Salt100g { get; init; }
    }
}
