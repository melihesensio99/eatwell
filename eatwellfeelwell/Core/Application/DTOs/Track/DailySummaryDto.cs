using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Track
{
    public class DailySummaryDto
    {
        public DateTime Date { get; set; }
        public float TotalCalorie { get; set; }
        public float TotalFat { get; set; }
        public float TotalProtein { get; set; }
        public float TotalCarb { get; set; }

        public List<ConsumedItemDto> ConsumedItems { get; set; }

    }

}
