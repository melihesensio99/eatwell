using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class ProductAnalysisDto
    {
        public string? ProductName { get; set; }
        [JsonProperty("image_front_url")]
        public string? ImageFrontUrl { get; set; } //ürünün ön yüzünün resmi
        public string? NovaGroup { get; set; }
        public int? NutritionScoreBeverage { get; set; }
        public string? NutritionGrades { get; set; }
        public string[]? AdditivesTags { get; set; }
        public List<string>? AdditiveDescriptions { get; set; }
        public string Fat { get; set; }
        public string Salt { get; set; }
        [JsonProperty("saturated-fat")]
        public string SaturatedFat { get; set; }
        public string Sugars { get; set; }
        public int Score { get; set; }
        public bool IsHealthy { get; set; }
    }
}
