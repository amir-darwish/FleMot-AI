namespace FleMot.Api.Services;

public interface IGeminiService
{
    Task<string> GetExamplesAsync(string word, int exampleCount);
}