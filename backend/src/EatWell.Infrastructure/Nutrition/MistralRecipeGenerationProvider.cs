using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using EatWell.Application.Common.Recipes;
using EatWell.Infrastructure.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EatWell.Infrastructure.Nutrition;

public sealed class MistralRecipeGenerationProvider : IRecipeGenerationProvider
{
    private readonly HttpClient _httpClient;
    private readonly IDistributedCache _cache;
    private readonly ILogger<MistralRecipeGenerationProvider> _logger;
    private readonly string _apiKey;
    private readonly string _model;

    public MistralRecipeGenerationProvider(
        HttpClient httpClient,
        IConfiguration configuration,
        IDistributedCache cache,
        ILogger<MistralRecipeGenerationProvider> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
        _apiKey = configuration["Mistral:ApiKey"]
            ?? throw new InvalidOperationException("Mistral:ApiKey configuration is missing.");
        _model = configuration["Mistral:Model"] ?? "mistral-large-latest";
    }

    public async Task<GeneratedRecipeDto> GenerateAsync(
        RecipeGenerationInputDto input,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"recipes:generate:{CreateCacheHash(input)}";
        if (input.ImageBase64 is null)
        {
            var cached = await TryGetCacheAsync(cacheKey, cancellationToken);
            if (cached is not null)
                return cached;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/chat/completions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        request.Content = JsonContent.Create(new
        {
            model = _model,
            temperature = 0.3,
            messages = new object[]
            {
                new { role = "system", content = BuildSystemPrompt(input) },
                BuildUserMessage(input)
            },
            response_format = new
            {
                type = "json_schema",
                json_schema = new { name = "eatwell_recipe", schema = Schema }
            }
        });

        using var response = await ExternalHttpClient.SendAsync(
            _httpClient, request, "Mistral", cancellationToken);

        var result = await ExternalHttpClient.ReadStructuredChatResponseAsync<GeneratedRecipeDto>(
            response, "Mistral", cancellationToken);

        if (input.ImageBase64 is null)
            await TrySetCacheAsync(cacheKey, result, cancellationToken);

        return result;
    }

    private async Task<GeneratedRecipeDto?> TryGetCacheAsync(
        string key,
        CancellationToken cancellationToken)
    {
        try
        {
            var bytes = await _cache.GetAsync(key, cancellationToken);
            return bytes is null
                ? null
                : JsonSerializer.Deserialize<GeneratedRecipeDto>(bytes);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(exception, "Redis tarif cache okunamadı. Key: {CacheKey}", key);
            return null;
        }
    }

    private async Task TrySetCacheAsync(
        string key,
        GeneratedRecipeDto value,
        CancellationToken cancellationToken)
    {
        try
        {
            await _cache.SetAsync(
                key,
                JsonSerializer.SerializeToUtf8Bytes(value),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
                },
                cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(exception, "Redis tarif cache yazılamadı. Key: {CacheKey}", key);
        }
    }

    private static string CreateCacheHash(RecipeGenerationInputDto input)
    {
        var normalized = JsonSerializer.Serialize(new
        {
            promptVersion = "tr-v2",
            ingredients = input.Ingredients.Select(x => x.Trim().ToLowerInvariant()).OrderBy(x => x),
            input.Servings,
            dietaryPreference = input.DietaryPreference?.Trim().ToLowerInvariant(),
            imageHash = string.IsNullOrWhiteSpace(input.ImageBase64)
                ? null
                : Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(input.ImageBase64)))
        });
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(normalized));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static object BuildUserMessage(RecipeGenerationInputDto input)
    {
        var text = JsonSerializer.Serialize(new
        {
            ingredients = input.Ingredients,
            servings = input.Servings,
            dietaryPreference = input.DietaryPreference
        });

        if (string.IsNullOrWhiteSpace(input.ImageBase64))
            return new { role = "user", content = text };

        var dataUrl = $"data:{input.MimeType};base64,{input.ImageBase64}";
        return new
        {
            role = "user",
            content = new object[]
            {
                new { type = "text", text },
                new { type = "image_url", image_url = dataUrl }
            }
        };
    }

    private static string BuildSystemPrompt(RecipeGenerationInputDto input)
    {
        if (input.Ingredients.Count > 0 && !string.IsNullOrWhiteSpace(input.ImageBase64))
            return CombinedSystemPrompt;

        return string.IsNullOrWhiteSpace(input.ImageBase64)
            ? IngredientsSystemPrompt
            : ImageSystemPrompt;
    }

    private const string IngredientsSystemPrompt = """
        Sen EatWell uygulamasının tarif oluşturma asistanısın.
        JSON içindeki recipeName, description, ingredients.name, ingredients.quantity, steps ve assumptions alanlarının tamamını Türkçe yaz.
        Kullanıcı başka bir dil istemediği sürece hiçbir açıklama veya malzeme adını İngilizce yazma.
        Türkçe yazım ve karakterleri kontrol et; özellikle sandviç, yoğurt, soğan, çörek otu ve köfte gibi kelimeleri doğru Türkçe yaz.
        Kullanıcının verdiği malzemeleri temel alarak uygulanabilir bir yemek tarifi oluştur.
        Tarif adı, kısa açıklama, gerekli miktarlarla malzemeler ve sıralı pişirme adımları üret.
        Kullanıcının istemediği veya listede olmayan temel dışı malzemeleri mümkün olduğunca ekleme.
        Eksik bir temel malzeme gerekiyorsa bunu malzeme listesinde açıkça belirt.
        Besin değerlerini porsiyon başına yaklaşık tahmin et ve kesin tıbbi iddia verme.
        Sadece JSON döndür; markdown veya açıklama ekleme.
        """;

    private const string ImageSystemPrompt = """
        Sen EatWell uygulamasının yemek fotoğrafı analiz ve tarif oluşturma asistanısın.
        JSON içindeki recipeName, description, ingredients.name, ingredients.quantity, steps ve assumptions alanlarının tamamını Türkçe yaz.
        Görseldeki yabancı ürün veya marka adları dışında hiçbir metni İngilizce yazma.
        Türkçe yazım ve karakterleri kontrol et; özellikle sandviç, yoğurt, soğan, çörek otu ve köfte gibi kelimeleri doğru Türkçe yaz.
        Fotoğraftaki yemeği tanımla ve mümkün olan en makul tarifini oluştur.
        Görülebilen malzemeleri çıkar ve miktarlarını yaklaşık olarak tahmin et.
        Fotoğraftan kesin bilinemeyen bilgileri assumptions alanında belirt.
        Görselde görünmeyen pişirme yöntemini kesinmiş gibi söyleme.
        Fotoğraftan tahmin edilen malzemelerde source=image ve 0 ile 1 arasında confidence kullan.
        Besin değerlerini porsiyon başına yaklaşık tahmin et; tıbbi veya kesin sağlık iddiası verme.
        Sadece JSON döndür; markdown veya ek açıklama ekleme.
        """;

    private const string CombinedSystemPrompt = """
        Sen EatWell uygulamasının tarif oluşturma asistanısın.
        JSON içindeki recipeName, description, ingredients.name, ingredients.quantity, steps ve assumptions alanlarının tamamını Türkçe yaz.
        Kullanıcı başka bir dil istemediği sürece hiçbir açıklama veya malzeme adını İngilizce yazma.
        Türkçe yazım ve karakterleri kontrol et; özellikle sandviç, yoğurt, soğan, çörek otu ve köfte gibi kelimeleri doğru Türkçe yaz.
        Fotoğraftaki yemeği analiz et ve kullanıcının ayrıca verdiği malzemeleri de dikkate al.
        Kullanıcının yazdığı malzemeler kesin kabul edilir ve source=user olarak işaretlenir.
        Fotoğraftan tahmin edilen malzemeler source=image ve 0 ile 1 arasında confidence ile döndürülür.
        İki kaynaktaki bilgileri birleştirerek uygulanabilir bir tarif oluştur.
        Belirsiz bilgileri assumptions alanında belirt.
        Besin değerlerini porsiyon başına yaklaşık tahmin et; tıbbi veya kesin sağlık iddiası verme.
        Sadece JSON döndür; markdown veya ek açıklama ekleme.
        """;

    private static readonly object Schema = new
    {
        type = "object",
        additionalProperties = false,
        properties = new
        {
            recipeName = new { type = "string" },
            description = new { type = "string" },
            ingredients = new
            {
                type = "array",
                minItems = 1,
                items = new
                {
                    type = "object",
                    additionalProperties = false,
                    properties = new
                    {
                        name = new { type = "string" },
                        quantity = new { type = "string" },
                        source = new { type = "string", @enum = new[] { "user", "image", "assistant" } },
                        confidence = new { type = "number", minimum = 0, maximum = 1 }
                    },
                    required = new[] { "name", "quantity", "source", "confidence" }
                }
            },
            steps = new { type = "array", minItems = 1, items = new { type = "string" } },
            preparationMinutes = new { type = "integer", minimum = 0, maximum = 1440 },
            cookingMinutes = new { type = "integer", minimum = 0, maximum = 1440 },
            servings = new { type = "integer", minimum = 1, maximum = 12 },
            caloriesPerServing = new { type = new[] { "number", "null" }, minimum = 0, maximum = 5000 },
            proteinGramsPerServing = new { type = new[] { "number", "null" }, minimum = 0, maximum = 300 },
            carbohydratesGramsPerServing = new { type = new[] { "number", "null" }, minimum = 0, maximum = 500 },
            fatGramsPerServing = new { type = new[] { "number", "null" }, minimum = 0, maximum = 300 }
            ,assumptions = new { type = "array", items = new { type = "string" } }
        },
        required = new[]
        {
            "recipeName", "description", "ingredients", "steps", "preparationMinutes",
            "cookingMinutes", "servings", "caloriesPerServing", "proteinGramsPerServing",
            "carbohydratesGramsPerServing", "fatGramsPerServing", "assumptions"
        }
    };

}
