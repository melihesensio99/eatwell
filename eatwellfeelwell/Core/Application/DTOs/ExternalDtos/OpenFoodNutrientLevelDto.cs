using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ExternalDtos
{
    public class OpenFoodNutrientLevelDto
    {
        public string Fat { get; set; } // Yuksek veya Düşük gibi değerler alır

        public string Salt { get; set; }

        [JsonProperty("saturated-fat")]
        public string SaturatedFat { get; set; }

        public string Sugars { get; set; }
    }
}
