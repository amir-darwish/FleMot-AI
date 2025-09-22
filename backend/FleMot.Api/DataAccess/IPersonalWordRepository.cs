using FleMot.Api.Models.Entites;
namespace FleMot.Api.DataAccess;

public interface IPersonalWordRepository
{
    Task CreateAsync(PersonalWord word);
    Task<bool> ExistsAsync(string userId, string word);
    
    Task<List<PersonalWord>> GetByUserIdAsync(string userId);
    Task<PersonalWord?> GetByIdAsync(string id);
    Task<bool> DeleteAsync(string id);
}