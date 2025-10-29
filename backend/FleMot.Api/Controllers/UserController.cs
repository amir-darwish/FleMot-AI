using FleMot.Api.Models.DTOs;
using FleMot.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FleMot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // تأمين كل شيء في هذا الـ Controller
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    // المسار الجديد سيكون: PUT /api/user/language
    [HttpPut("language")]
    public async Task<IActionResult> UpdateLanguage([FromBody] UpdateLanguageRequest request)
    {
        var authId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (authId is null) return Unauthorized();

        await _userService.UpdateUserLanguageAsync(authId, request.Language);

        return Ok(new { message = "Langue mise à jour avec succès" });
    }
}