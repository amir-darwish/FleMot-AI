using FleMot.Api.Models.DTOs;
using FleMot.Api.Models.Entites;

namespace FleMot.Api.Services;

public interface IWordSaveService
{
    Task <PersonalWord> SaveWordAsync(string authId, SaveWordRequest data);

}