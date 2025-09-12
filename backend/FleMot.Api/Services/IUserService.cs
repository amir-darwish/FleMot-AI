using FleMot.Api.Models.Entites;

namespace FleMot.Api.Services;

public interface IUserService
{
    Task<User> RegisterOrGetUserAsync(string authId);
}