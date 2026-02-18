using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Product
    {
        public string? Code { get; set; } //barcode

        public string? ProductName { get; set; }

        public string? ImageFrontUrl { get; set; } //ürünün ön yüzünün resmi

        public int? AdditivesN { get; set; }

        public string[]? AdditivesTags { get; set; } //katkı maddeleri tags

        public string? AllergensFromIngredients { get; set; }
      
        public string[]? AllergensHierarchy { get; set; }

        public string? NovaGroup { get; set; } // 1: unprocessed or minimally processed foods, 2: processed culinary ingredients, 3: processed foods, 4: ultra-processed food and drink products

        public string[]? QualityTags { get; set; } // urun dogrulanmis veya dogrulanmamis gibi bilgiler

        public string? NutritionGrades { get; set; } // a, b, c, d, e harfleriyle besin kalitesi derecelendirmesi
        public int? NutritionScoreBeverage { get; set; } // 1-10 arasında bir puan, içeceklerin besin kalitesini değerlendirmek için kullanılır. Düşük puanlar daha sağlıklı içecekleri gösterir.

        public float? Salt100g { get; set; }

        public float? Fat100g { get; set; }

        public float? SaturatedFat100g { get; set; }

        public float? Sugars100g { get; set; }

        public float? Carbohydrates100g { get; set; }

        public float? EnergyKcal100g { get; set; }

        public float? Proteins100g { get; set; }
        public string? Fat { get; set; } // Yuksek veya Düşük gibi değerler alır

        public string? Salt { get; set; }
        public string? SaturatedFat { get; set; }

        public string? Sugars { get; set; }

    }
}
