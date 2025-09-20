using FleMot.Api.Models.DTOs;
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
    
    [BsonElement("examples")]
    public ExamplePairDto[] Examples { get; set; } = Array.Empty<ExamplePairDto>();
    
    [BsonElement("savedAt")]
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}