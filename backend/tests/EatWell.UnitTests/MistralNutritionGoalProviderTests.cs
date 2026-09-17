using System.Net;
using System.Text;
using EatWell.Application.Common.Nutrition;
using EatWell.Infrastructure.Nutrition;
using Microsoft.Extensions.Configuration;

namespace EatWell.UnitTests;

public sealed class MistralNutritionGoalProviderTests
{
    [Fact]
    public async Task Provider_parses_structured_nutrition_goal_response()
    {
        const string response = """
        {
          "choices": [
            {
              "message": {
                "content": "{\"dailyCalories\":2200,\"proteinGrams\":165,\"carbohydratesGrams\":220,\"fatGrams\":73,\"bmr\":1800,\"tdee\":2200,\"goalAdjustmentPercentage\":0,\"assumptions\":[],\"warnings\":[]}"
              }
            }
          ]
        }
        """;

        var provider = CreateProvider(response);
        var result = await provider.CalculateAsync(CreateInput());

        Assert.Equal(2200, result.DailyCalories);
        Assert.Equal(165, result.ProteinGrams);
        Assert.Equal(220, result.CarbohydratesGrams);
        Assert.Equal(73, result.FatGrams);
    }

    [Fact]
    public async Task Provider_throws_when_mistral_returns_empty_content()
    {
        var provider = CreateProvider("{ \"choices\": [] }");

        await Assert.ThrowsAsync<EatWell.Application.Common.Exceptions.ExternalServiceException>(() =>
            provider.CalculateAsync(CreateInput()));
    }

    [Fact]
    public async Task Provider_throws_when_structured_content_is_invalid_json()
    {
        var provider = CreateProvider(
            "{ \"choices\": [{ \"message\": { \"content\": \"not-json\" } }] }");

        await Assert.ThrowsAsync<EatWell.Application.Common.Exceptions.ExternalServiceException>(() =>
            provider.CalculateAsync(CreateInput()));
    }

    [Fact]
    public async Task Provider_throws_external_service_exception_when_mistral_fails()
    {
        var provider = CreateProvider("{\"error\":{\"message\":\"failed\"}}", HttpStatusCode.BadGateway);

        await Assert.ThrowsAsync<EatWell.Application.Common.Exceptions.ExternalServiceException>(() =>
            provider.CalculateAsync(CreateInput()));
    }

    private static NutritionGoalInputDto CreateInput() => new(
        "male", 31, 80, 180, "moderate", "maintain_weight", null);

    private static MistralNutritionGoalProvider CreateProvider(
        string responseJson,
        HttpStatusCode statusCode = HttpStatusCode.OK)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Mistral:ApiKey"] = "test-api-key",
                ["Mistral:Model"] = "test-model"
            })
            .Build();

        var handler = new StubHttpMessageHandler(responseJson, statusCode);
        var client = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.mistral.ai/")
        };

        return new MistralNutritionGoalProvider(client, configuration);
    }

    private sealed class StubHttpMessageHandler(
        string responseJson,
        HttpStatusCode statusCode) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(new HttpResponseMessage(statusCode)
            {
                Content = new StringContent(responseJson, Encoding.UTF8, "application/json")
            });
        }
    }
}
