using FleMot.Api.DataAccess;
using FleMot.Api.Models.Entites;

namespace FleMot.Api.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    
    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

     public async Task <User> RegisterOrGetUserAsync(string authId)
    {
        var existingUser = await _userRepository.GetByAuthIdAsync(authId);
        if (existingUser != null) return existingUser;
        else
        {
            var newUser = new User{AuthId = authId, Role = "standard", WordCount = 0};
            await _userRepository.CreateAsync(newUser);
            return newUser;
        }
    }
}