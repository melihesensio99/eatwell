using Application.Abstracts.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FoodAnalysisController : ControllerBase
    {
        private readonly IFoodAnalysisService _foodAnalysisService;

        public FoodAnalysisController(IFoodAnalysisService foodAnalysisService)
        {
            _foodAnalysisService = foodAnalysisService;
        }

        [HttpGet("{barcode}")]
        public async Task<IActionResult> AnalyzeProduct(string barcode, [FromQuery] string? deviceId)
        {
            var result = await _foodAnalysisService.AnalyzeProduct(barcode, deviceId);
            return Ok(result);
        }

        public class ImageAnalysisRequest
        {
            public string Base64Image { get; set; } = string.Empty;
            public string? DeviceId { get; set; }
        }

        [HttpPost("analyze-image")]
        public async Task<IActionResult> AnalyzeImage([FromBody] ImageAnalysisRequest request)
        {
            if (string.IsNullOrEmpty(request.Base64Image))
            {
                return BadRequest("Görsel boş olamaz.");
            }

            var result = await _foodAnalysisService.AnalyzeImage(request.Base64Image, request.DeviceId);
            return Ok(result);
        }
    }
}
