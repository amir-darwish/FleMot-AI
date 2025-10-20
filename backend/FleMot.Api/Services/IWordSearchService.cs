using System.Security.Claims;
using FleMot.Api.Models.DTOs;

namespace FleMot.Api.Services;

public interface IWordSearchService
{
    public Task<ExamplePairDto[]> SearchAsync(string word,ClaimsPrincipal userPrincipal);
}