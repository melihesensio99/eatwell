namespace EatWell.Application.Common.Foods;

public interface IFoodProvider
{
    Task<IReadOnlyList<FoodSearchResultDto>> SearchAsync(
        string query,
        CancellationToken cancellationToken = default);

    Task<FoodDetailsDto?> GetByBarcodeAsync(
        string barcode,
        CancellationToken cancellationToken = default);
}
