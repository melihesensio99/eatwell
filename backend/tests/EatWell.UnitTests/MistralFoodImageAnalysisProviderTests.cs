using System.Net;
using System.Text;
using EatWell.Application.Common.Foods;
using EatWell.Application.Features.Foods.Queries.AnalyzeFoodImage;
using EatWell.Infrastructure.Nutrition;
using Microsoft.Extensions.Configuration;

namespace EatWell.UnitTests;

public sealed class MistralFoodImageAnalysisProviderTests
{
    [Fact]
    public async Task Provider_sends_base64_image_and_parses_three_health_advice_items()
    {
        const string response = """
        {
          "choices": [
            {
                "message": {
                "content": "{\"productName\":\"Test Yemek\",\"estimatedPortionGrams\":350,\"caloriesPer100Grams\":250,\"proteinPer100Grams\":8,\"carbohydratesPer100Grams\":25,\"fatPer100Grams\":10,\"sugarsPer100Grams\":5,\"saturatedFatPer100Grams\":3,\"saltPer100Grams\":1,\"detectedComponents\":[\"hamur\",\"peynir\"],\"allergens\":[\"milk\"],\"healthAdvice\":[\"Olumlu yön\",\"Dikkat edilmesi gereken yön\",\"Tüketim önerisi\"],\"analysis\":\"Genel analiz\"}"
              }
            }
          ]
        }
        """;

        var handler = new StubHttpMessageHandler(response, HttpStatusCode.OK);
        var provider = CreateProvider(handler);

        var result = await provider.AnalyzeAsync(
            "data:image/png;base64,AAAA", CancellationToken.None);

        Assert.Equal("Test Yemek", result.ProductName);
        Assert.Equal(250, result.CaloriesPer100Grams);
        Assert.Equal(3, result.HealthAdvice.Count);
        Assert.Contains("image/png", handler.LastRequestBody);
        Assert.Contains("AAAA", handler.LastRequestBody);
    }

    [Fact]
    public async Task Provider_wraps_failed_mistral_response()
    {
        var handler = new StubHttpMessageHandler("{}", HttpStatusCode.BadGateway);
        var provider = CreateProvider(handler);

        await Assert.ThrowsAsync<EatWell.Application.Common.Exceptions.ExternalServiceException>(() =>
            provider.AnalyzeAsync("data:image/jpeg;base64,AAAA", CancellationToken.None));
    }

    private static MistralFoodImageAnalysisProvider CreateProvider(StubHttpMessageHandler handler)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Mistral:ApiKey"] = "test-api-key",
                ["Mistral:VisionModel"] = "test-vision-model"
            })
            .Build();

        var client = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.mistral.ai/")
        };
        return new MistralFoodImageAnalysisProvider(client, configuration);
    }

    private sealed class StubHttpMessageHandler(
        string responseJson,
        HttpStatusCode statusCode) : HttpMessageHandler
    {
        public string LastRequestBody { get; private set; } = string.Empty;

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            LastRequestBody = await request.Content!.ReadAsStringAsync(cancellationToken);
            return new HttpResponseMessage(statusCode)
            {
                Content = new StringContent(responseJson, Encoding.UTF8, "application/json")
            };
        }
    }
}

public sealed class AnalyzeFoodImageQueryValidatorTests
{
    private readonly AnalyzeFoodImageQueryValidator _validator = new();

    [Theory]
    [InlineData("image/jpeg")]
    [InlineData("image/png")]
    [InlineData("image/webp")]
    public async Task Validator_accepts_supported_image_types(string mimeType)
    {
        var base64 = mimeType switch
        {
            "image/jpeg" => "/9j/4A==",
            "image/png" => "iVBORw0KGgo=",
            "image/webp" => "UklGRgAAAABXRUJQ",
            _ => throw new InvalidOperationException()
        };

        var result = await _validator.ValidateAsync(
            new AnalyzeFoodImageQuery(base64, mimeType));

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Validator_rejects_unsupported_image_type()
    {
        var result = await _validator.ValidateAsync(
            new AnalyzeFoodImageQuery("AAAA", "application/pdf"));

        Assert.False(result.IsValid);
    }

    [Fact]
    public async Task Validator_rejects_payload_when_mime_type_does_not_match_content()
    {
        var result = await _validator.ValidateAsync(
            new AnalyzeFoodImageQuery("iVBORw0KGgo=", "image/jpeg"));

        Assert.False(result.IsValid);
    }

    [Fact]
    public async Task Validator_rejects_invalid_base64_payload()
    {
        var result = await _validator.ValidateAsync(
            new AnalyzeFoodImageQuery("not-base64", "image/png"));

        Assert.False(result.IsValid);
    }
}
