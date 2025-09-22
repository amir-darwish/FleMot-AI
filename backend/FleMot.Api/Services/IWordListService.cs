using FleMot.Api.Models.Entites;

namespace FleMot.Api.Services;

public interface IWordListService
{
    Task<List<PersonalWord>> GetUserWordListAsync(string authId);
    Task DeleteWordAsync(string authId, string wordId);
}