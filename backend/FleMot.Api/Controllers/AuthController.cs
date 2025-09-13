using FleMot.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FleMot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("register")]
    [Authorize]
    public async Task<IActionResult> RegisterAsync()
    {
        var authId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (String.IsNullOrEmpty(authId))
        {
            return Unauthorized();
        }
        var user = await _userService.RegisterOrGetUserAsync(authId);
        return Ok(user);
    }
}