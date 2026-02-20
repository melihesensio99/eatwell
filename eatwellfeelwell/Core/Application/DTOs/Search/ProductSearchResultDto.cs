namespace Application.DTOs.Search
{
    public class ProductSearchResultDto
    {
        public string Code { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string? Brands { get; set; }
        public string? ImageUrl { get; set; }
        public string? NutritionGrade { get; set; }
        public double? CaloriesPer100g { get; set; }
    }

    public class ProductSearchResponseDto
    {
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public List<ProductSearchResultDto> Products { get; set; } = new();
    }
}
