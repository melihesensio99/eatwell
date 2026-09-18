using EatWell.Application.Common.Recipes;
using EatWell.Application.Features.Recipes.Commands.SaveRecipe;

namespace EatWell.UnitTests;

public sealed class RecipeValidatorTests
{
    private static SaveRecipeCommand ValidCommand(IReadOnlyList<GeneratedRecipeIngredientDto>? ingredients = null) => new(
        "Sebzeli omlet", "Kısa ve dengeli bir tarif.", ingredients ?? [new("Yumurta", "2 adet", "user", 1)], ["Malzemeleri hazırla.", "Pişir."], 5, 10, 2, 250, 18, 12, 14, "https://youtube.com/results?search_query=omlet");

    [Fact]
    public void Valid_recipe_is_accepted()
    {
        var result = new SaveRecipeCommandValidator().Validate(ValidCommand());
        Assert.True(result.IsValid);
    }

    [Fact]
    public void More_than_ten_ingredients_are_rejected()
    {
        var ingredients = Enumerable.Range(1, 11).Select(index => new GeneratedRecipeIngredientDto($"Malzeme {index}", "1 adet", "user", 1)).ToArray();
        var result = new SaveRecipeCommandValidator().Validate(ValidCommand(ingredients));
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Empty_recipe_name_is_rejected()
    {
        var command = ValidCommand() with { RecipeName = "" };
        var result = new SaveRecipeCommandValidator().Validate(command);
        Assert.False(result.IsValid);
    }
}
