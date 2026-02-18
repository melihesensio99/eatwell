using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class DailyLog
    {
        public int Id { get; set; }
        public string? DeviceId { get; set; }
        public string? Code { get; set; }

        public float Amount { get; set; }
        public DateTime LogDate { get; set; }
    }
}
