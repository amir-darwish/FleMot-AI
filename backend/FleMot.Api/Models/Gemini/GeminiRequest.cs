namespace FleMot.Api.Models.Gemini;

// C# 12 record syntax is simpler for DTOs
public record GeminiRequest(Content[] contents);
public record Content(Part[] parts);

public record Part (string text);