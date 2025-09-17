using FleMot.Api.Services; // لا تنس تحديث الـ using
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FleMot.Api.Models.DTOs;
namespace FleMot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WordsController : ControllerBase
{
    // يحتاج فقط إلى الخدمة الجديدة
    private readonly IWordSearchService _wordSearchService;

    public WordsController(IWordSearchService wordSearchService)
    {
        _wordSearchService = wordSearchService;
    }

    [HttpPost("search")]
    public async Task<IActionResult> SearchWord([FromBody] SearchRequest request)
    {
        var authId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (authId is null) return Unauthorized();

        // أصبح الـ Controller بسيطًا جدًا: يستدعي الخدمة ويمرر لها المعلومات
        var examples = await _wordSearchService.SearchAsync(request.Word, authId);

        return Ok(new { Word = request.Word, Examples = examples });
    }
}