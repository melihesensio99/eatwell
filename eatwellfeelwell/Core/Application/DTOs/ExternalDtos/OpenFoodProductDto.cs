using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ExternalDtos
{
    public class OpenFoodProductDto
    {
        [JsonProperty("product_name")]
        public string? ProductName { get; set; }

        [JsonProperty("image_front_url")]
        public string? ImageFrontUrl { get; set; } //ürünün ön yüzünün resmi

        [JsonProperty("nutrient_levels")]
        public OpenFoodNutrientLevelDto NutrientLevels { get; set; }

        [JsonProperty("nutriments")]
        public OpenFoodNutrimentsDto Nutriments { get; set; }

        [JsonProperty("additives_n")] //katkı maddeleri
        public int? AdditivesN { get; set; }

        [JsonProperty("additives_tags")] 
        public string[]? AdditivesTags { get; set; } //katkı maddeleri tags

        [JsonProperty("allergens_from_ingredients")]
        public string? AllergensFromIngredients { get; set; }

        [JsonProperty("allergens_hierarchy")] //azdan coka geliyor 
        public string[]? AllergensHierarchy { get; set; }

        [JsonProperty("nova_group")]
        public string? NovaGroup { get; set; } // 1: unprocessed or minimally processed foods, 2: processed culinary ingredients, 3: processed foods, 4: ultra-processed food and drink products

        [JsonProperty("quality_tags")]
        public string[]? QualityTags { get; set; } // urun dogrulanmis veya dogrulanmamis gibi bilgiler

        [JsonProperty("nutrition_grades")]
        public string? NutritionGrades { get; set; } // a, b, c, d, e harfleriyle besin kalitesi derecelendirmesi
        [JsonProperty("nutrition_score_beverage")]
        public int? NutritionScoreBeverage { get; set; } // 1-10 arasında bir puan, içeceklerin besin kalitesini değerlendirmek için kullanılır. Düşük puanlar daha sağlıklı içecekleri gösterir.


    }
}
