using EatWell.Application.Common.Foods;
using EatWell.Application.Common.Authentication;
using EatWell.Infrastructure.Authentication;
using EatWell.Infrastructure.Foods;
using EatWell.Application.Common.Nutrition;
using EatWell.Application.Common.Recipes;
using EatWell.Infrastructure.Nutrition;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EatWell.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis") ?? "localhost:6379";
            options.InstanceName = "eatwell:";
        });
        services.AddSingleton<IFirebaseTokenVerifier, FirebaseTokenVerifier>();
        services.AddHttpClient<IFoodProvider, OpenFoodFactsProvider>(client =>
        {
            client.BaseAddress = new Uri("https://world.openfoodfacts.org/");
            client.Timeout = TimeSpan.FromSeconds(10);
            client.DefaultRequestHeaders.UserAgent.ParseAdd("EatWell/1.0 (contact: eatwell@example.com)");
        });
        services.AddHttpClient<INutritionGoalProvider, MistralNutritionGoalProvider>(client =>
        {
            client.BaseAddress = new Uri("https://api.mistral.ai/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        services.AddHttpClient<IFoodImageAnalysisProvider, MistralFoodImageAnalysisProvider>(client =>
        {
            client.BaseAddress = new Uri("https://api.mistral.ai/");
            client.Timeout = TimeSpan.FromSeconds(60);
        });
        services.AddHttpClient<IRecipeGenerationProvider, MistralRecipeGenerationProvider>(client =>
        {
            client.BaseAddress = new Uri("https://api.mistral.ai/");
            client.Timeout = TimeSpan.FromSeconds(60);
        });
        return services;
    }
}
