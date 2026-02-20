using Newtonsoft.Json;

namespace Application.DTOs.ExternalDtos
{
    public class OpenFoodSearchResponseDto
    {
        [JsonProperty("count")]
        public int Count { get; set; }

        [JsonProperty("page")]
        public int Page { get; set; }

        [JsonProperty("page_size")]
        public int PageSize { get; set; }

        [JsonProperty("products")]
        public List<OpenFoodSearchProductDto>? Products { get; set; }
    }

    public class OpenFoodSearchProductDto
    {
        [JsonProperty("code")]
        public string? Code { get; set; }

        [JsonProperty("product_name")]
        public string? ProductName { get; set; }

        [JsonProperty("brands")]
        public string? Brands { get; set; }

        [JsonProperty("image_front_small_url")]
        public string? ImageFrontSmallUrl { get; set; }

        [JsonProperty("nutrition_grades")]
        public string? NutritionGrades { get; set; }

        [JsonProperty("nova_group")]
        public string? NovaGroup { get; set; }

        [JsonProperty("nutriments")]
        public OpenFoodNutrimentsDto? Nutriments { get; set; }
    }
}
