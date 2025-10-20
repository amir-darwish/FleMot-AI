using System.Security.Claims;
using FleMot.Api.DataAccess;
using FleMot.Api.Exceptions;
using FleMot.Api.Models.DTOs;
using FleMot.Api.Models.Entites;

namespace FleMot.Api.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    
    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User> RegisterOrGetUserAsync(ClaimsPrincipal userPrincipal, RegisterRequest? request)
    {
        var authId = userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(authId)) throw new UserNotFoundException("Unknown");

        var existingUser = await _userRepository.GetByAuthIdAsync(authId);
        if (existingUser != null)
        {
            return existingUser; 
        }
        
        // try to get first and last name from token or request body
        var tokenName = userPrincipal.FindFirstValue("name"); 
        var firstName = string.Empty;
        var lastName = string.Empty;

        if (!string.IsNullOrEmpty(tokenName))
        {
            var nameParts = tokenName.Split(' ', 2);
            firstName = nameParts[0];
            lastName = nameParts.Length > 1 ? nameParts[1] : "";
        }
        
        if (string.IsNullOrEmpty(firstName) && request != null)
        {
            firstName = request.FirstName;
            lastName = request.LastName;
        }
        

        var newUser = new User
        {
            AuthId = authId,
            FirstName = firstName,
            LastName = lastName,
            Role = "standard",
            WordCount = 0,
            OriginalLanguage = "English",
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(newUser);
        return newUser;
    }
}