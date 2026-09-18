namespace EatWell.Domain.Recipes;

public sealed class SavedRecipe
{
    public Guid Id { get; private set; }
    public string UserId { get; private set; } = string.Empty;
    public string RecipeName { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string IngredientsJson { get; private set; } = "[]";
    public string StepsJson { get; private set; } = "[]";
    public int PreparationMinutes { get; private set; }
    public int CookingMinutes { get; private set; }
    public int Servings { get; private set; }
    public decimal? CaloriesPerServing { get; private set; }
    public decimal? ProteinGramsPerServing { get; private set; }
    public decimal? CarbohydratesGramsPerServing { get; private set; }
    public decimal? FatGramsPerServing { get; private set; }
    public string YoutubeSearchUrl { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }

    private SavedRecipe() { }

    public SavedRecipe(string userId, string recipeName, string description, string ingredientsJson, string stepsJson, int preparationMinutes, int cookingMinutes, int servings, decimal? caloriesPerServing, decimal? proteinGramsPerServing, decimal? carbohydratesGramsPerServing, decimal? fatGramsPerServing, string youtubeSearchUrl)
    {
        Id = Guid.NewGuid(); UserId = userId; RecipeName = recipeName; Description = description; IngredientsJson = ingredientsJson; StepsJson = stepsJson; PreparationMinutes = preparationMinutes; CookingMinutes = cookingMinutes; Servings = servings; CaloriesPerServing = caloriesPerServing; ProteinGramsPerServing = proteinGramsPerServing; CarbohydratesGramsPerServing = carbohydratesGramsPerServing; FatGramsPerServing = fatGramsPerServing; YoutubeSearchUrl = youtubeSearchUrl; CreatedAt = DateTimeOffset.UtcNow;
    }
}
