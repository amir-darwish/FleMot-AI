using FleMot.Api.Models.Entites;
using MongoDB.Driver;

namespace FleMot.Api.DataAccess;

public class PersonalWordRepository : IPersonalWordRepository
{
    private readonly IMongoCollection<PersonalWord> _personalWordCollection;
    public PersonalWordRepository(IMongoDatabase database)
    {
        _personalWordCollection = database.GetCollection<PersonalWord>("personalWords");
    }
    public async Task<bool> ExistsAsync(string userId, string word)
    {
        var filter = Builders<PersonalWord>.Filter.Eq(pw => pw.UserId, userId) &
                     Builders<PersonalWord>.Filter.Eq(pw => pw.Word, word);
        var result = await _personalWordCollection.Find(filter).FirstOrDefaultAsync();
        
        // If result is not null, the word exists for the user , we return true
        // Otherwise, we return false
        return result != null;
    }
    public async Task CreateAsync(PersonalWord word)
    {
         await _personalWordCollection.InsertOneAsync(word);
    }
     
    public async Task<List<PersonalWord>> GetByUserIdAsync(string userId)
    {
       return await _personalWordCollection.Find(pw => userId == pw.UserId).ToListAsync();
    }
    public async Task<PersonalWord?> GetByIdAsync(string id)
    {
        return await _personalWordCollection.Find(pw => pw.Id == id).FirstOrDefaultAsync();
    }
    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _personalWordCollection.DeleteOneAsync(pw => pw.Id == id);
        return result.DeletedCount > 0;
    }
}