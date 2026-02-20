using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Track
{
    public class ConsumedItemDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string? ProductName { get; set; }
        public float Amount { get; set; }
        public float Calories { get; set; }
        public float Protein { get; set; }
        public float Fat { get; set; }
        public float Carb { get; set; }
    }
}
