using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ExternalDtos
{
    public class OpenFoodResponseDto
    {
        public OpenFoodProductDto? Product { get; set; }

        public string? Code { get; set; } //barcode

        public bool? Status { get; set; } //true if the product was found, false if not found, null if an error occurred

        [JsonProperty("status_verbose")]
        public string? StatusVerbose { get; set; }
    }
}
