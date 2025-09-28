using System.Text.Json;
using FleMot.Api.DataAccess;
using FleMot.Api.Exceptions;
using FleMot.Api.Models.DTOs;
using FleMot.Api.Models.Entites;
using MongoDB.Bson;

namespace FleMot.Api.Services;

public class WordSaveService : IWordSaveService
{
    private IUserRepository _userRepository;
    private IPersonalWordRepository _personalWordRepository;
    public WordSaveService(IUserRepository userRepository, IPersonalWordRepository personalWordRepository)
    {
        _userRepository = userRepository;
        _personalWordRepository = personalWordRepository;
    }
    public async Task<PersonalWord> SaveWordAsync(string authId, SaveWordRequest data)
    {
        var user = await _userRepository.GetByAuthIdAsync(authId);
        if (user == null || user.Id == null)
        {
            throw new UserNotFoundException(user.Id);
        }
        // --- 👇 اطبع البيانات التي استقبلتها الخدمة ---
        Console.WriteLine($"--- SERVICE CHECK ---");
        Console.WriteLine($"User ID being checked: {user.Id}");
        Console.WriteLine($"Word being checked: {data.Word}");
        Console.WriteLine($"---------------------");
        // ------------------------------------------
        var exists = await _personalWordRepository.ExistsAsync(user.Id, data.Word);
        if (exists)
        {
            throw new DuplicateWordException(data.Word);
        }

        if (user.Role == "standard" && user.WordCount >= 10)
        {
            throw new SaveLimitExceededException();
        }
        
        var newPersonalWord = new PersonalWord
        {
            UserId = user.Id,
            Word = data.Word,
            Examples = data.Examples, 
            SavedAt = DateTime.UtcNow
        };

        await _personalWordRepository.CreateAsync(newPersonalWord);
        user.WordCount += 1;
        await _userRepository.IncrementWordCountAsync(user.Id);
        return newPersonalWord;

    }
}