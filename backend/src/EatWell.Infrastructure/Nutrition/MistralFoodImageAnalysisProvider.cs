using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using EatWell.Application.Common.Exceptions;
using EatWell.Application.Common.Foods;
using Microsoft.Extensions.Configuration;

namespace EatWell.Infrastructure.Nutrition;

public sealed class MistralFoodImageAnalysisProvider : IFoodImageAnalysisProvider
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;

    public MistralFoodImageAnalysisProvider(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Mistral:ApiKey"]
            ?? throw new InvalidOperationException("Mistral:ApiKey configuration is missing.");
        _model = configuration["Mistral:VisionModel"] ?? "pixtral-12b-2409";
    }

    public async Task<FoodImageAnalysisDto> AnalyzeAsync(
        string imageDataUrl,
        CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/chat/completions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        request.Content = JsonContent.Create(new
        {
            model = _model,
            temperature = 0.2,
            max_tokens = 1000,
            messages = new object[]
            {
                new { role = "system", content = SystemPrompt },
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new { type = "text", text = "Görseldeki gıdayı analiz et ve sadece JSON döndür." },
                        new { type = "image_url", image_url = imageDataUrl }
                    }
                }
            },
            response_format = new
            {
                type = "json_schema",
                json_schema = new { name = "food_image_analysis", schema = Schema }
            }
        });

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();
        }
        catch (HttpRequestException exception)
        {
            throw new ExternalServiceException("Mistral Vision", exception);
        }
        catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            throw new ExternalServiceException("Mistral Vision", exception);
        }

        using (response)
        {
            var completion = await response.Content.ReadFromJsonAsync<MistralCompletionResponse>(
                cancellationToken);
            var content = completion?.Choices?.FirstOrDefault()?.Message?.Content;
            if (string.IsNullOrWhiteSpace(content))
                throw new ExternalServiceException(
                    "Mistral Vision", new InvalidOperationException("Boş görsel analiz cevabı."));

            var result = JsonSerializer.Deserialize<FoodImageAnalysisDto>(
                content,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return result ?? throw new ExternalServiceException(
                "Mistral Vision", new InvalidOperationException("Görsel analiz cevabı parse edilemedi."));
        }
    }

    private const string SystemPrompt = """
        Sen EatWell uygulamasının görsel gıda analiz asistanısın.
        Görseldeki gıdayı veya yemeği analiz et.
        Görsel ambalajlı ürün değil, pizza, yemek veya tabak fotoğrafı olabilir.
        Önce görünen yemeği tanımla ve tahmini porsiyon gramını belirt.
        Besin değerlerini mümkünse 100 gram üzerinden tahmin et; belirsizliği Analysis içinde açıkça belirt.
        Görselden kesin etiket bilgisi çıkarılamayacağı için Nutri-Score veya NOVA Group üretme.
        Emin olmadığın değerleri warnings alanı olmadığı için Analysis içinde açıkça belirt.
        Alerjenleri milk, nuts, peanuts, soybeans, gluten gibi kısa İngilizce canonical tag'ler olarak döndür.
        healthAdvice alanında tam olarak 3 madde döndür:
        1. Ürünün olumlu veya faydalı yönü.
        2. Şeker, tuz, doymuş yağ, işlenmişlik veya porsiyon açısından dikkat edilmesi gereken yön.
        3. Kullanıcıya uygulanabilir, genel ve tıbbi olmayan tüketim önerisi.
        Sağlık iddiası, teşhis, tedavi veya kesin güvenlik garantisi verme.
        Sadece JSON döndür; markdown veya açıklama ekleme.
        """;

    private static readonly object Schema = new
    {
        type = "object",
        additionalProperties = false,
        properties = new
        {
            productName = new { type = "string" },
            analysis = new { type = "string" },
            healthAdvice = new
            {
                type = "array",
                minItems = 3,
                maxItems = 3,
                items = new { type = "string" }
            },
            estimatedPortionGrams = new { type = new[] { "number", "null" }, minimum = 0, maximum = 5000 },
            caloriesPer100Grams = new { type = "number", minimum = 0, maximum = 1000 },
            proteinPer100Grams = new { type = "number", minimum = 0, maximum = 100 },
            carbohydratesPer100Grams = new { type = "number", minimum = 0, maximum = 100 },
            fatPer100Grams = new { type = "number", minimum = 0, maximum = 100 },
            sugarsPer100Grams = new { type = "number", minimum = 0, maximum = 100 },
            saturatedFatPer100Grams = new { type = "number", minimum = 0, maximum = 100 },
            saltPer100Grams = new { type = "number", minimum = 0, maximum = 100 },
            detectedComponents = new { type = "array", items = new { type = "string" } },
            allergens = new { type = "array", items = new { type = "string" } },
        },
        required = new[]
        {
            "productName", "analysis", "healthAdvice", "estimatedPortionGrams", "caloriesPer100Grams", "proteinPer100Grams",
            "carbohydratesPer100Grams", "fatPer100Grams", "sugarsPer100Grams",
            "saturatedFatPer100Grams", "saltPer100Grams", "detectedComponents", "allergens"
        }
    };

    private sealed class MistralCompletionResponse
    {
        [JsonPropertyName("choices")] public List<Choice>? Choices { get; init; }
    }

    private sealed class Choice
    {
        [JsonPropertyName("message")] public Message? Message { get; init; }
    }

    private sealed class Message
    {
        [JsonPropertyName("content")] public string? Content { get; init; }
    }
}
