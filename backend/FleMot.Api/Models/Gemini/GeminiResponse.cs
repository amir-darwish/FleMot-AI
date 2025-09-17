namespace FleMot.Api.Models.Gemini;

public record GeminiResponse(Candidate[] candidates);
public record Candidate(Content content);