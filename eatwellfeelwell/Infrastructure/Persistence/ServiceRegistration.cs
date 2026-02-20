using Application.Repositories;
using Domain.Entities;
using Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Persistence.Contexts;
using Persistence.Repositories;

namespace Persistence
{
    public static class ServiceRegistration
    {
        public static void AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<EatWellContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("PostgreSQL")));

            services.AddIdentity<AppUser, AppRole>(options =>
            {
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;

                options.User.RequireUniqueEmail = true;
            }).AddEntityFrameworkStores<EatWellContext>();

            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<IDailyLogRepository, DailyLogRepository>();
            services.AddScoped<IUserAllergenRepository, UserAllergenRepository>();
            services.AddScoped<ICalorieGoalRepository, CalorieGoalRepository>();

        }
    }
}
