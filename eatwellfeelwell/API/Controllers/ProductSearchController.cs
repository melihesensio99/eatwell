using Application.Abstracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductSearchController : ControllerBase
    {
        private readonly IProductSearchService _searchService;

        public ProductSearchController(IProductSearchService searchService)
        {
            _searchService = searchService;
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _searchService.SearchAsync(query, page, pageSize);
            return Ok(result);
        }
    }
}
