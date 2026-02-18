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
            services.AddScoped<IIFoodAnalysisService, FoodAnalysisService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IFoodCalorieInfoService, FoodCalorieInfoService>();
            services.AddScoped<IDailyLogService, DailyLogService>();
            services.AddHttpClient<IFoodApiClient, FoodApiClient>();
        }
    }
}
