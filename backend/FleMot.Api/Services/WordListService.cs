using FleMot.Api.DataAccess;
using FleMot.Api.Exceptions;
using FleMot.Api.Models.Entites;

namespace FleMot.Api.Services;

public class WordListService : IWordListService
{
    private readonly IPersonalWordRepository _personalWordRepository;
    private readonly IUserRepository _userRepository;
    
    public WordListService(IPersonalWordRepository personalWordRepository, IUserRepository userRepository)
    {
        _personalWordRepository = personalWordRepository;
        _userRepository = userRepository;
    }

    public async Task<List<PersonalWord>> GetUserWordListAsync(string authId)
    {
        var user = await _userRepository.GetByAuthIdAsync(authId);
        
        if (user == null || user.Id == null)
        {
            throw new UserNotFoundException(authId);
        }
        return await _personalWordRepository.GetByUserIdAsync(user.Id);
    }

    public async Task DeleteWordAsync(string authId, string wordId)
    {
        var user = await _userRepository.GetByAuthIdAsync(authId);
        
        if (user == null || user.Id == null)
        {
            throw new UserNotFoundException(authId);
        }
        
        var wordToDelete = _personalWordRepository.GetByIdAsync(wordId);
        
        if (wordToDelete == null || wordToDelete.Result == null)
        {
            throw new WordNotFoundException(wordId);
        }
        
        if (wordToDelete.Result.UserId != user.Id)
        {
            throw new UnauthorizedAccessException("You do not have permission to delete this word.");
        }
        
        await _personalWordRepository.DeleteAsync(wordId);
        await _userRepository.DecrementWordCountAsync(user.Id);
        
    }
}