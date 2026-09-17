namespace EatWell.Application.Common.Foods;

public interface IFoodImageAnalysisProvider
{
    Task<FoodImageAnalysisDto> AnalyzeAsync(
        string imageDataUrl,
        CancellationToken cancellationToken = default);
}

public sealed record FoodImageAnalysisDto(
    string ProductName,
    string Analysis,
    IReadOnlyList<string> HealthAdvice,
    decimal? EstimatedPortionGrams,
    decimal? CaloriesPer100Grams,
    decimal? ProteinPer100Grams,
    decimal? CarbohydratesPer100Grams,
    decimal? FatPer100Grams,
    decimal? SugarsPer100Grams,
    decimal? SaturatedFatPer100Grams,
    decimal? SaltPer100Grams,
    IReadOnlyList<string> DetectedComponents,
    IReadOnlyList<string> Allergens);
