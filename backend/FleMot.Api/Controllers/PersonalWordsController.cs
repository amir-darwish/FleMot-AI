using FleMot.Api.Models.DTOs;
using FleMot.Api.Services;
using FleMot.Api.Exceptions; 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
namespace FleMot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PersonalWordsController : ControllerBase
{
    private readonly IWordSaveService _wordSaveService;
    
    public PersonalWordsController(IWordSaveService wordSaveService)
    {
        _wordSaveService = wordSaveService;
    }

    [HttpPost]
    public async Task<IActionResult> SaveWord([FromBody] SaveWordRequest request)
    {
        try
        {
            var authId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (authId is null) return Unauthorized("Token invalide.");
            
            await _wordSaveService.SaveWordAsync(authId, request);
            return StatusCode(201); // Created
        } catch (UserNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (DuplicateWordException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (SaveLimitExceededException ex)
        {
            return StatusCode(403, new { message = ex.Message });

        }
        catch (Exception)
        {
            return StatusCode(500, "Une erreur interne est survenue.");
        }
    }
}