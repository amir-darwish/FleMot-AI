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
    private readonly IWordSearchService _wordSearchService;

    public WordsController(IWordSearchService wordSearchService)
    {
        _wordSearchService = wordSearchService;
    }

    [HttpPost("search")]
    public async Task<IActionResult> SearchWord([FromBody] SearchRequest request)
    {
        if (string.IsNullOrEmpty(request.Word))
        {
            return BadRequest("Le mot ne peut pas être vide.");
        }

        var authId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (authId is null) return Unauthorized();

        var examples = await _wordSearchService.SearchAsync(request.Word, authId);

        if (examples.Length == 0)
        {
            return BadRequest("Le mot est introuvable ou n'est pas un mot français valide.");
        }

        return Ok(new { Word = request.Word, Examples = examples });


   

    }
}