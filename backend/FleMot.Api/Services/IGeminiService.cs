using FleMot.Api.Models.DTOs;

namespace FleMot.Api.Services;

public interface IGeminiService
{
    Task<ExamplePairDto[]> GetExamplesAsync(string word, int exampleCount);
}