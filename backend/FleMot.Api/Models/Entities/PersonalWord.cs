using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FleMot.Api.Models.Entites;

public class PersonalWord
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("userId")]
    public string UserId { get; set; } = null!;
    
    [BsonElement("word")]
    public string Word { get; set; } = null!;
    
    [BsonElement("geminiReponse")]
    public BsonDocument GeminiReponse { get; set; } = null!;
    
    [BsonElement("saveAt")]
    public DateTime SaveAt { get; set; } = DateTime.UtcNow;
}