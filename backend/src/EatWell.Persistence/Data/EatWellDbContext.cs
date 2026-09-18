using EatWell.Domain.DailyLogs;
using EatWell.Domain.Users;
using EatWell.Domain.NutritionGoals;
using EatWell.Domain.Recipes;
using Microsoft.EntityFrameworkCore;

namespace EatWell.Persistence.Data;

public sealed class EatWellDbContext : DbContext
{
    public EatWellDbContext(DbContextOptions<EatWellDbContext> options)
        : base(options) { }

    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<UserAllergen> UserAllergens => Set<UserAllergen>();
    public DbSet<FavoriteFood> FavoriteFoods => Set<FavoriteFood>();
    public DbSet<DailyLog> DailyLogs => Set<DailyLog>();
    public DbSet<DailyLogItem> DailyLogItems => Set<DailyLogItem>();
    public DbSet<NutritionGoal> NutritionGoals => Set<NutritionGoal>();
    public DbSet<SavedRecipe> SavedRecipes => Set<SavedRecipe>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(profile => profile.UserId);
            entity.Property(profile => profile.UserId).HasMaxLength(128);
            entity.Property(profile => profile.DisplayName).HasMaxLength(100);
            entity.Property(profile => profile.Gender).HasMaxLength(20);
        });

        modelBuilder.Entity<UserAllergen>(entity =>
        {
            entity.HasKey(allergen => new { allergen.UserId, allergen.AllergenTag });
            entity.Property(allergen => allergen.UserId).HasMaxLength(128);
            entity.Property(allergen => allergen.AllergenTag).HasMaxLength(100);
            entity.HasOne<UserProfile>()
                .WithMany()
                .HasForeignKey(allergen => allergen.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FavoriteFood>(entity =>
        {
            entity.HasKey(food => new { food.UserId, food.FoodExternalId });
            entity.Property(food => food.UserId).HasMaxLength(128);
            entity.Property(food => food.FoodExternalId).HasMaxLength(128);
            entity.Property(food => food.FoodName).HasMaxLength(300).IsRequired();
            entity.Property(food => food.Brand).HasMaxLength(200);
            entity.Property(food => food.Barcode).HasMaxLength(50);
            entity.HasOne<UserProfile>()
                .WithMany()
                .HasForeignKey(food => food.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DailyLog>(entity =>
        {
            entity.HasKey(log => log.Id);
            entity.Property(log => log.Id).ValueGeneratedNever();
            entity.Property(log => log.UserId).HasMaxLength(128).IsRequired();
            entity.Property(log => log.LogDate).IsRequired();
            entity.Property(log => log.WaterConsumedMilliliters).HasPrecision(10, 2);
            entity.HasIndex(log => new { log.UserId, log.LogDate }).IsUnique();
            entity.HasOne<UserProfile>()
                .WithMany()
                .HasForeignKey(log => log.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DailyLogItem>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).ValueGeneratedNever();
            entity.Property(item => item.FoodExternalId).HasMaxLength(128).IsRequired();
            entity.Property(item => item.FoodName).HasMaxLength(300).IsRequired();
            entity.Property(item => item.Brand).HasMaxLength(200);
            entity.Property(item => item.Barcode).HasMaxLength(50);
            entity.Property(item => item.MealType).HasMaxLength(30).IsRequired();
            entity.HasOne(item => item.DailyLog)
                .WithMany(log => log.Items)
                .HasForeignKey(item => item.DailyLogId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(item => item.DailyLogId);
        });

        modelBuilder.Entity<NutritionGoal>(entity =>
        {
            entity.HasKey(goal => goal.UserId);
            entity.Property(goal => goal.UserId).HasMaxLength(128);
            entity.Property(goal => goal.Source).IsRequired();
            entity.HasOne<UserProfile>()
                .WithOne()
                .HasForeignKey<NutritionGoal>(goal => goal.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SavedRecipe>(entity =>
        {
            entity.HasKey(recipe => recipe.Id);
            entity.Property(recipe => recipe.UserId).HasMaxLength(128).IsRequired();
            entity.Property(recipe => recipe.RecipeName).HasMaxLength(300).IsRequired();
            entity.Property(recipe => recipe.Description).HasMaxLength(4000);
            entity.Property(recipe => recipe.IngredientsJson).IsRequired();
            entity.Property(recipe => recipe.StepsJson).IsRequired();
            entity.Property(recipe => recipe.YoutubeSearchUrl).HasMaxLength(1000);
            entity.HasIndex(recipe => new { recipe.UserId, recipe.CreatedAt });
            entity.HasOne<UserProfile>().WithMany().HasForeignKey(recipe => recipe.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
