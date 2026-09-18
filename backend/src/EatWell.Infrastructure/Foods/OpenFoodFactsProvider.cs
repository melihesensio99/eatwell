using System.Text.Json;
using System.Text.Json.Serialization;
using EatWell.Application.Common.Foods;
using EatWell.Infrastructure.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace EatWell.Infrastructure.Foods;

public sealed class OpenFoodFactsProvider : IFoodProvider
{
    private readonly HttpClient _httpClient;
    private readonly IDistributedCache? _cache;
    private readonly ILogger<OpenFoodFactsProvider>? _logger;
    private const string Fields = "code,product_name,product_name_tr,brands,image_url,nutriments,nutrition_grades,nova_group,ingredients_text,allergens_tags";
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public OpenFoodFactsProvider(
        HttpClient httpClient,
        IDistributedCache? cache = null,
        ILogger<OpenFoodFactsProvider>? logger = null)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IReadOnlyList<FoodSearchResultDto>> SearchAsync(
        string query,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"foods:search:{Normalize(query)}";
        var cached = await TryGetCacheAsync<FoodSearchResultDto[]>(cacheKey, cancellationToken);
        if (cached is not null)
            return cached;

        var url = $"api/v2/search?search_terms={Uri.EscapeDataString(query)}&page_size=20&fields={Fields}";
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        using var responseMessage = await ExternalHttpClient.SendAsync(
            _httpClient, request, "OpenFoodFacts", cancellationToken);
        var response = await ExternalHttpClient.ReadJsonAsync<SearchResponse>(
            responseMessage, "OpenFoodFacts", cancellationToken);

        var result = response?.Products?
            .Where(product => !string.IsNullOrWhiteSpace(product.ProductName))
            .Select(ToSearchResult)
            .ToArray() ?? [];

        await TrySetCacheAsync(cacheKey, result, TimeSpan.FromMinutes(5), cancellationToken);
        return result;
    }

    public async Task<FoodDetailsDto?> GetByBarcodeAsync(
        string barcode,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"foods:barcode:{Normalize(barcode)}";
        var cached = await TryGetCacheAsync<FoodDetailsDto>(cacheKey, cancellationToken);
        if (cached is not null)
            return cached;

        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"api/v2/product/{Uri.EscapeDataString(barcode)}.json?fields={Fields}");
        using var responseMessage = await ExternalHttpClient.SendAsync(
            _httpClient, request, "OpenFoodFacts", cancellationToken);
        var response = await ExternalHttpClient.ReadJsonAsync<ProductResponse>(
            responseMessage, "OpenFoodFacts", cancellationToken);

        var result = response?.Status == 1 && response.Product is not null
            ? ToDetails(response.Product)
            : null;

        if (result is not null)
            await TrySetCacheAsync(cacheKey, result, TimeSpan.FromHours(24), cancellationToken);

        return result;
    }

    private async Task<T?> TryGetCacheAsync<T>(string key, CancellationToken cancellationToken)
    {
        try
        {
            if (_cache is null)
                return default;

            var bytes = await _cache.GetAsync(key, cancellationToken);
            return bytes is null ? default : JsonSerializer.Deserialize<T>(bytes, JsonOptions);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger?.LogWarning(exception, "Redis cache okunamadı. Key: {CacheKey}", key);
            return default;
        }
    }

    private async Task TrySetCacheAsync<T>(
        string key,
        T value,
        TimeSpan expiration,
        CancellationToken cancellationToken)
    {
        try
        {
            if (_cache is null)
                return;

            var bytes = JsonSerializer.SerializeToUtf8Bytes(value, JsonOptions);
            await _cache.SetAsync(key, bytes, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration
            }, cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger?.LogWarning(exception, "Redis cache yazılamadı. Key: {CacheKey}", key);
        }
    }

    private static string Normalize(string value) =>
        value.Trim().ToLowerInvariant();

    private static FoodSearchResultDto ToSearchResult(Product product) => new(
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
