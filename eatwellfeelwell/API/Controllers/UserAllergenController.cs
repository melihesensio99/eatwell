using Application.Abstracts.Services;
using Application.DTOs;
using Application.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserAllergenController : ControllerBase
    {
        private readonly IUserAllergenService _allergenService;

        public UserAllergenController(IUserAllergenService allergenService)
        {
            _allergenService = allergenService;
        }

       
        [HttpGet("all")]
        public IActionResult GetAllAllergens()
        {
            var allergens = AllergenDictionary.GetAll()
                .Select(a => new
                {
                    Key = a.Key,
                    Name = a.Value.TurkishName,
                    Emoji = a.Value.Emoji
                })
                .ToList();

            return Ok(allergens);
        }

       
        [HttpGet("{deviceId}")]
        public async Task<IActionResult> GetUserAllergens(string deviceId)
        {
            var allergens = await _allergenService.GetUserAllergensAsync(deviceId);
            return Ok(allergens);
        }

        
        [HttpPost("set")]
        public async Task<IActionResult> SetUserAllergens([FromBody] SetUserAllergensDto request)
        {
            await _allergenService.SetUserAllergensAsync(request.DeviceId, request.AllergenKeys);
            return Ok(new { message = "Alerjenler başarıyla kaydedildi" });
        }
    }
}
