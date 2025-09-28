using System.Text.RegularExpressions;
using FleMot.Api.Models.Entites;
using MongoDB.Bson;
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
        var regexFilter = new BsonRegularExpression($"^{Regex.Escape(word)}$", "i");

        var filter = Builders<PersonalWord>.Filter.Eq(pw => pw.UserId, userId) &
                     Builders<PersonalWord>.Filter.Regex(pw => pw.Word, regexFilter);

        var count = await _personalWordCollection.CountDocumentsAsync(filter);
        return count > 0;
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