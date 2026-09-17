using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using EatWell.Application.Common.Nutrition;
using EatWell.Application.Common.Exceptions;
using Microsoft.Extensions.Configuration;

namespace EatWell.Infrastructure.Nutrition;

public sealed class MistralNutritionGoalProvider : INutritionGoalProvider
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;

    public MistralNutritionGoalProvider(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Mistral:ApiKey"]
            ?? throw new InvalidOperationException("Mistral:ApiKey configuration is missing.");
        _model = configuration["Mistral:Model"] ?? "mistral-large-latest";
    }

    public async Task<NutritionGoalCalculationDto> CalculateAsync(
        NutritionGoalInputDto input,
        CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/chat/completions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        request.Content = JsonContent.Create(new
        {
            model = _model,
            temperature = 0,
            messages = new[]
            {
                new { role = "system", content = SystemPrompt },
                new { role = "user", content = BuildUserPrompt(input) }
            },
            response_format = new
            {
                type = "json_schema",
                json_schema = new
                {
                    name = "nutrition_goal",
                    schema = NutritionGoalSchema
                }
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
            throw new ExternalServiceException("Mistral", exception);
        }
        catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            throw new ExternalServiceException("Mistral", exception);
        }

        using (response)
        {
            return await ParseResponseAsync(response, cancellationToken);
        }
    }

    private static async Task<NutritionGoalCalculationDto> ParseResponseAsync(
        HttpResponseMessage response,
        CancellationToken cancellationToken)
    {
        var completion = await response.Content.ReadFromJsonAsync<MistralCompletionResponse>(
            cancellationToken);
        var content = completion?.Choices?.FirstOrDefault()?.Message?.Content;

        if (string.IsNullOrWhiteSpace(content))
            throw new ExternalServiceException(
                "Mistral",
                new InvalidOperationException("Boş structured response."));

        var result = JsonSerializer.Deserialize<NutritionGoalCalculationDto>(
            content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return result ?? throw new ExternalServiceException(
            "Mistral",
            new InvalidOperationException("Structured response parse edilemedi."));
    }

    private static string BuildUserPrompt(NutritionGoalInputDto input)
    {
        var inputJson = JsonSerializer.Serialize(input);
        return "Aşağıdaki kullanıcı bilgilerine göre günlük beslenme hedeflerini hesapla:\n\n" +
               inputJson +
               "\n\nCevapta yalnızca JSON dön.";
    }

    private const string SystemPrompt = """
        Sen EatWell uygulamasının beslenme hedefi hesaplama asistanısın.
        Mifflin-St Jeor formülünü temel alarak BMR ve TDEE hesapla.
        Aktivite seviyesine göre TDEE hesapla.
        lose_weight için yaklaşık %15-20 azalt, maintain_weight için TDEE'yi koru,
        gain_weight için yaklaşık %10-15 artır.
        Protein, yağ ve karbonhidrat hedeflerini günlük kaloriye göre hesapla.
        Gram değerlerini sayı olarak döndür.
        Eksik veya çelişkili bilgileri warnings alanında belirt.
        Tıbbi teşhis veya tedavi önerisi verme.
        Sadece istenen JSON nesnesini döndür; markdown veya açıklama ekleme.
        """;

    private static readonly object NutritionGoalSchema = new
    {
        type = "object",
        additionalProperties = false,
        properties = new
        {
            dailyCalories = new { type = "number", minimum = 800, maximum = 6000 },
            proteinGrams = new { type = "number", minimum = 0, maximum = 500 },
            carbohydratesGrams = new { type = "number", minimum = 0, maximum = 1000 },
            fatGrams = new { type = "number", minimum = 0, maximum = 300 },
            bmr = new { type = "number", minimum = 0 },
            tdee = new { type = "number", minimum = 0 },
            goalAdjustmentPercentage = new { type = "number", minimum = -50, maximum = 50 },
            assumptions = new { type = "array", items = new { type = "string" } },
            warnings = new { type = "array", items = new { type = "string" } }
        },
        required = new[]
        {
            "dailyCalories", "proteinGrams", "carbohydratesGrams", "fatGrams",
            "bmr", "tdee", "goalAdjustmentPercentage", "assumptions", "warnings"
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
