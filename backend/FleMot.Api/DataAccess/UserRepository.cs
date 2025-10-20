using System.Runtime.InteropServices.ComTypes;
using FleMot.Api.Models.Entites;
using MongoDB.Driver;

namespace FleMot.Api.DataAccess;

public class UserRepository: IUserRepository
{
    private readonly IMongoCollection<User> _usersCollection;

    public UserRepository(IMongoDatabase database)
    {
        _usersCollection = database.GetCollection<User>("users");
    }

    public async Task<User?> GetByAuthIdAsync(string authId)
    {
        return await _usersCollection.Find(u => u.AuthId == authId).FirstOrDefaultAsync();
    }

    public Task CreateAsync(User user)
    {
        return _usersCollection.InsertOneAsync(user);
    }
    
    public async Task IncrementWordCountAsync(string userId)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
        var update = Builders<User>.Update.Inc(u => u.WordCount, 1);
        await _usersCollection.UpdateOneAsync(filter, update);
    }
    
    public async Task DecrementWordCountAsync(string userId)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
        var update = Builders<User>.Update.Inc(u => u.WordCount, -1);
        await _usersCollection.UpdateOneAsync(filter, update);
    }
    
    public async Task UpdateLanguageAsync(string userId, string language)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
        var update = Builders<User>.Update.Set(u => u.OriginalLanguage, language);
        await _usersCollection.UpdateOneAsync(filter, update);
    }

}