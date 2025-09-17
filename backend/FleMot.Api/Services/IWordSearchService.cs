namespace FleMot.Api.Services;

public interface IWordSearchService
{
    public Task<string> SearchAsync(string word,string authId);
}