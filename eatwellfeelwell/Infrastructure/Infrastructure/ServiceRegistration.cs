using Application.Abstracts.Services;
using Application.Abstracts.Services.ExternalServices;
using Infrastructure.Services;
using Infrastructure.Services.ExternalServices;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure
{
    public static class ServiceRegistration
    {
        public static void AddInfrastructureServices(this IServiceCollection services)
        {
            services.AddScoped<IFoodAnalysisService, FoodAnalysisService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IFoodCalorieInfoService, FoodCalorieInfoService>();
            services.AddScoped<IDailyLogService, DailyLogService>();
            services.AddScoped<IUserAllergenService, UserAllergenService>();
            services.AddScoped<ICalorieGoalService, CalorieGoalService>();
            services.AddHttpClient<IFoodApiClient, FoodApiClient>();
            services.AddHttpClient<IGeminiService, GeminiService>();
            services.AddScoped<IAiChatService, AiChatService>();
            services.AddScoped<IProductSearchService, ProductSearchService>();
        }
    }
}
