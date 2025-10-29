using System.Net.Http.Json;
using FleMot.Api.Models.DTOs;
using FleMot.Api.Models.Entites;
using FleMot.Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using Moq;

namespace FleMot.Api.Tests;

[Collection("Sequential")]
public class WordSearchLogicTests : IClassFixture<FleMotApiFactory>
{
    private readonly FleMotApiFactory _factory;

    public WordSearchLogicTests(FleMotApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task SearchWord_WhenUserIsStandard_ShouldReturnTwoExamples()
    {
        // --- ARRANGE ---
        var mockGeminiService = new Mock<IGeminiService>();
        var fakeGeminiExamples = new[]
        {
            new ExamplePairDto("Exemple 1", "Translation 1"),
            new ExamplePairDto("Exemple 2", "Translation 2"),
            
        };
        mockGeminiService
            .Setup(s => s.GetExamplesAsync(It.IsAny<string>(), 2, It.IsAny<string>())) // Expect a request for 2
            .ReturnsAsync(fakeGeminiExamples); // Still return the full list
        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.AddScoped<IGeminiService>(_ => mockGeminiService.Object);

                services.AddAuthentication("Test")
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
            });
        }).CreateClient();

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
            await db.Client.DropDatabaseAsync("TestDb"); 
            var users = db.GetCollection<User>("users");
            await users.InsertOneAsync(new User { AuthId = "test-auth-id", Role = "standard" });
        }

        var requestData = new SearchRequest("test");

        // --- ACT ---
        var response = await client.PostAsJsonAsync("/api/words/search", requestData);

        // --- ASSERT ---
        response.EnsureSuccessStatusCode();
        var responseData = await response.Content.ReadFromJsonAsync<SearchResponse>();

        Assert.NotNull(responseData);
        
        Assert.Equal(2, responseData.Examples.Length);
    }
    
    [Fact]
    public async Task SearchWord_WhenUserIsPremium_ShouldReturnFourExamples()
    {
        // --- ARRANGE ---
        var mockGeminiService = new Mock<IGeminiService>();
        var fakeGeminiExamples = new[]
        {
            new ExamplePairDto("Exemple 1", "Translation 1"),
            new ExamplePairDto("Exemple 2", "Translation 2"),
            new ExamplePairDto("Exemple 3", "Translation 3"),
            new ExamplePairDto("Exemple 4", "Translation 4"),
        };
        mockGeminiService
            .Setup(s => s.GetExamplesAsync(It.IsAny<string>(), 4, It.IsAny<string>())) // Expect a request for 4
            .ReturnsAsync(fakeGeminiExamples); // Still return the full list
        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.AddScoped<IGeminiService>(_ => mockGeminiService.Object);

                services.AddAuthentication("Test")
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
            });
        }).CreateClient();

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
            await db.Client.DropDatabaseAsync("TestDb"); 
            var users = db.GetCollection<User>("users");
            await users.InsertOneAsync(new User { AuthId = "test-auth-id", Role = "premium" });
        }

        var requestData = new SearchRequest("test");

        // --- ACT ---
        var response = await client.PostAsJsonAsync("/api/words/search", requestData);

        // --- ASSERT ---
        response.EnsureSuccessStatusCode();
        var responseData = await response.Content.ReadFromJsonAsync<SearchResponse>();

        Assert.NotNull(responseData);
        
        Assert.Equal(4, responseData.Examples.Length);
    }

}

public record SearchResponse(string Word, ExamplePairDto[] Examples);