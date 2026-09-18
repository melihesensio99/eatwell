using EatWell.Application.Common.Persistence;
using EatWell.Application.Common.Recipes;
using EatWell.Persistence.Data;
using EatWell.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EatWell.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<EatWellDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("PostgreSQL")));

        services.AddScoped<IUserProfileRepository, UserProfileRepository>();
        services.AddScoped<IDailyLogRepository, DailyLogRepository>();
        services.AddScoped<INutritionGoalRepository, NutritionGoalRepository>();
        services.AddScoped<IUserAllergenRepository, UserAllergenRepository>();
        services.AddScoped<IFavoriteFoodRepository, FavoriteFoodRepository>();
        services.AddScoped<ISavedRecipeRepository, SavedRecipeRepository>();
        return services;
    }
}
