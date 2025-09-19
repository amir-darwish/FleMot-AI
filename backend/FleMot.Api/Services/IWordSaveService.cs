using FleMot.Api.Models.DTOs;

namespace FleMot.Api.Services;

public interface IWordSaveService
{
    Task SaveWordAsync(string authId, SaveWordRequest data);

}