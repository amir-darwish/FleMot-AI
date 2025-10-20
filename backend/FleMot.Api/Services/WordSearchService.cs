using System.Security.Claims;
using FleMot.Api.Models.DTOs;

namespace FleMot.Api.Services;

public class WordSearchService : IWordSearchService
{
    private readonly IUserService _userService;
    private readonly IGeminiService _geminiService;

    public WordSearchService(IUserService userService, IGeminiService geminiService)
    {
        _userService = userService;
        _geminiService = geminiService;
    }

    public async Task<ExamplePairDto[]> SearchAsync(string word, ClaimsPrincipal userPrincipal)
    {
        
        var user = await _userService.RegisterOrGetUserAsync(userPrincipal, null);

        var exampleCount = user.Role.Equals("premium", StringComparison.OrdinalIgnoreCase) ? 4 : 2;
        var examples = await _geminiService.GetExamplesAsync(word, exampleCount);
        return examples;
    }
}