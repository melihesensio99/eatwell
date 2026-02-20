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
    }
}
