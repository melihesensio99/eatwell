using Application.Abstracts.Services;
using Application.DTOs.Chat;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AiChatController : ControllerBase
    {
        private readonly IAiChatService _aiChatService;

        public AiChatController(IAiChatService aiChatService)
        {
            _aiChatService = aiChatService;
        }

       
        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] ChatRequestDto request)
        {
            var response = await _aiChatService.AskAsync(request);
            return Ok(response);
        }
    }
}
