using Domain.Entities;
using Domain.Entities.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Contexts
{
    public class EatWellContext : IdentityDbContext<AppUser, AppRole, string>
    {
        public EatWellContext(DbContextOptions<EatWellContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<DailyLog> DailyLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Product>(entity =>
            {
                entity.HasKey(p => p.Code);
                entity.Property(p => p.Code).HasMaxLength(50);
                entity.Property(p => p.ProductName).HasMaxLength(500);
            });
        }
    }
}
