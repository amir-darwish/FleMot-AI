using FleMot.Api.Models.Entites;

namespace FleMot.Api.DataAccess;

public interface IUserRepository
{
    Task<User?> GetByAuthIdAsync(string authId);

    Task CreateAsync(User user);
    Task IncrementWordCountAsync(string userId);
    
    Task DecrementWordCountAsync(string userId);
    
    Task UpdateLanguageAsync(string userId, string language);
    
}
    
    