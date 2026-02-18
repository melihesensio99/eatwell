using Application.Abstracts.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class Test : ControllerBase
    {
        private readonly IIFoodAnalysisService _foodAnalysisService;
        private readonly IFoodCalorieInfoService _FoodCalorieInfoService;

        public Test(IIFoodAnalysisService foodAnalysisService, IFoodCalorieInfoService foodCalorieInfoService)
        {
            _foodAnalysisService = foodAnalysisService;
            _FoodCalorieInfoService = foodCalorieInfoService;
        }

        [HttpGet("analysis/{barcode}")]
        public async Task<IActionResult> GetAnalysis(string barcode)
        {
           var data = await _foodAnalysisService.AnalyzeProduct(barcode);   
            return Ok(data);
        }


        [HttpGet("calorie/{barcode}")]
        public async Task<IActionResult> GetCalorie(string barcode)
        {
            var data = await _FoodCalorieInfoService.GetCalorieInfo(barcode);
            return Ok(data);
        }
    }
}
