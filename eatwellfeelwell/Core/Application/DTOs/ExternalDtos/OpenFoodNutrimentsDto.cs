using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ExternalDtos
{
    public class OpenFoodNutrimentsDto
    {

        [JsonProperty("salt_100g")]
        public float? Salt100g { get; set; }


        [JsonProperty("fat_100g")]
        public float? Fat100g { get; set; }


        [JsonProperty("saturated-fat_100g")]
        public float? SaturatedFat100g { get; set; }

        [JsonProperty("sugars_100g")]
        public float? Sugars100g { get; set; }

        [JsonProperty("carbohydrates_100g")]
        public float? Carbohydrates100g { get; set; }

        [JsonProperty("energy-kcal_100g")]
        public float? EnergyKcal100g { get; set; }


        [JsonProperty("proteins_100g")]
        public float? Proteins100g { get; set; }

    }
}
