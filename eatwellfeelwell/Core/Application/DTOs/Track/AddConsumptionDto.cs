using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class AddConsumptionDto
    {
        public string? DeviceId { get; set; }
        public string? Code { get; set; } 
        public float Amount { get; set; }   
        public DateTime? Date { get; set; }   
    }
}
