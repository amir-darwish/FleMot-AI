using System.Text.Json;
using FleMot.Api.DataAccess;
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
    public async Task SaveWordAsync(string authId, SaveWordRequest data)
    {
        var user = await _userRepository.GetByAuthIdAsync(authId);
        if (user == null || user.Id == null)
        {
            throw new Exception("User not found");
        }

        var exists = await _personalWordRepository.ExistsAsync(user.Id, data.Word);
        if (exists)
        {
            throw new Exception("Word already exists");
        }

        if (user.Role == "standard" && user.WordCount >= 10)
        {
            throw new Exception("Limit of 10 words reached");
        }
        
        var newPersonalWord = new PersonalWord
        {
            UserId = user.Id,
            Word = data.Word,
            GeminiResponse = BsonDocument.Parse(JsonSerializer.Serialize(data.Examples)), 
            SavedAt = DateTime.UtcNow
        };

        await _personalWordRepository.CreateAsync(newPersonalWord);
        user.WordCount += 1;
        await _userRepository.IncrementWordCountAsync(user.Id);

    }
}