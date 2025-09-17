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

    public async  Task<string> SearchAsync(string word, string authId)
    {
        var user = await _userService.RegisterOrGetUserAsync(authId);
        var exampleCount = user.Role.Equals("premium", StringComparison.OrdinalIgnoreCase) ? 4 : 2;
        var example = await _geminiService.GetExamplesAsync(word, exampleCount);
        return example;
    }
}