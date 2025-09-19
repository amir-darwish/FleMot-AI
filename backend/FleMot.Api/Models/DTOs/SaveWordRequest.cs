namespace FleMot.Api.Models.DTOs;

public record SaveWordRequest(string Word, ExamplePairDto[] Examples);