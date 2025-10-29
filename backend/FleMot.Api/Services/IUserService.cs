using System.Security.Claims;
using FleMot.Api.Models.DTOs;
using FleMot.Api.Models.Entites;

namespace FleMot.Api.Services;

public interface IUserService
{
    Task<User> RegisterOrGetUserAsync(ClaimsPrincipal userPrincipal, RegisterRequest? request);
    Task UpdateUserLanguageAsync(string authId, string language);
}