using System.Net;
using System.Text;
using EatWell.Infrastructure.Foods;

namespace EatWell.UnitTests;

public sealed class OpenFoodFactsProviderTests
{
    [Fact]
    public async Task Search_maps_open_food_facts_response_to_application_dto()
    {
        const string json = """
        {
          "products": [
            {
              "code": "123456",
              "product_name": "Chicken Breast",
              "product_name_tr": "Tavuk Göğsü",
              "brands": "Example Brand",
              "image_url": "https://example.com/chicken.jpg",
              "nutrition_grades": "a",
              "nova_group": 1,
              "nutriments": { "energy-kcal_100g": 165 }
            }
          ]
        }
        """;

        var provider = CreateProvider(json);

        var result = await provider.SearchAsync("tavuk");

        var food = Assert.Single(result);
        Assert.Equal("123456", food.ExternalId);
        Assert.Equal("Tavuk Göğsü", food.Name);
        Assert.Equal("Example Brand", food.Brand);
        Assert.Equal(165, food.CaloriesPer100Grams);
        Assert.Equal("a", food.NutriScore);
        Assert.Equal(1, food.NovaGroup);
    }

    [Fact]
    public async Task Get_by_barcode_returns_details_when_product_exists()
    {
        const string json = """
        {
          "status": 1,
          "product": {
            "code": "123456",
            "product_name": "Chicken Breast",
              "brands": "Example Brand",
              "nutrition_grades": "a",
              "nova_group": 1,
              "ingredients_text": "chicken breast",
              "allergens_tags": ["en:milk"],
              "nutriments": {
                "energy-kcal_100g": 165,
                "proteins_100g": 31,
                "carbohydrates_100g": 0,
                "fat_100g": 3.6,
                "sugars_100g": 56.3,
                "saturated-fat_100g": 10.6,
                "salt_100g": 0.107
            }
          }
        }
        """;

        var provider = CreateProvider(json);

        var result = await provider.GetByBarcodeAsync("123456");

        Assert.NotNull(result);
        Assert.Equal("123456", result.ExternalId);
        Assert.Equal(165, result.CaloriesPer100Grams);
        Assert.Equal(31, result.ProteinPer100Grams);
        Assert.Equal(3.6m, result.FatPer100Grams);
        Assert.Equal("a", result.NutriScore);
        Assert.Equal(1, result.NovaGroup);
        Assert.Equal("chicken breast", result.IngredientsText);
        Assert.Contains("en:milk", result.AllergensTags);
        Assert.Equal(56.3m, result.SugarsPer100Grams);
        Assert.Equal(10.6m, result.SaturatedFatPer100Grams);
        Assert.Equal(0.107m, result.SaltPer100Grams);
    }

    [Fact]
    public async Task Get_by_barcode_returns_null_when_product_does_not_exist()
    {
        var provider = CreateProvider("{ \"status\": 0 }");

        var result = await provider.GetByBarcodeAsync("unknown");

        Assert.Null(result);
    }

    private static OpenFoodFactsProvider CreateProvider(string responseJson)
    {
        var handler = new StubHttpMessageHandler(responseJson);
        var client = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://world.openfoodfacts.org/")
        };

        return new OpenFoodFactsProvider(client);
    }

    private sealed class StubHttpMessageHandler(string responseJson) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(responseJson, Encoding.UTF8, "application/json")
            });
        }
    }
}
