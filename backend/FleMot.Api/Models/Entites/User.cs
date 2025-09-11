using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FleMot.Api.Models.Entites;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }


    [BsonElement("authID")]
    public string AuthId { get; set; } = null!;

    [BsonElement("role")]
    public string Role { get; set; } = "standard";

    [BsonElement("wordCount")] 
    public int WordCount { get; set; } = 0;
    
    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
}