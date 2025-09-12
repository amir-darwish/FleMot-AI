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

}