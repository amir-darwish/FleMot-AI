using FleMot.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FleMot.Api.Models.DTOs;

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

    public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest? request)
    {
        var user = await _userService.RegisterOrGetUserAsync(User, request); 
        return Ok(user);
    }
}