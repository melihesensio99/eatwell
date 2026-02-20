using Application.Abstracts.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FoodCalorieController : ControllerBase
    {
        private readonly IFoodCalorieInfoService _foodCalorieInfoService;

        public FoodCalorieController(IFoodCalorieInfoService foodCalorieInfoService)
        {
            _foodCalorieInfoService = foodCalorieInfoService;
        }

        [HttpGet("{barcode}")]
        public async Task<IActionResult> GetCalorieInfo(string barcode)
        {
            var result = await _foodCalorieInfoService.GetCalorieInfo(barcode);
            return Ok(result);
        }
    }
}
