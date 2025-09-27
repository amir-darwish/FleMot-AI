
using System.Net.Http.Json;
using FleMot.Api.Models.DTOs;
using FleMot.Api.Models.Entites;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;


namespace FleMot.Api.Tests;

public class PersonalWordsControllerTests : IClassFixture<FleMotApiFactory>
{
    private readonly FleMotApiFactory _factory;
    private readonly IServiceScopeFactory _scopeFactory;
    public PersonalWordsControllerTests(FleMotApiFactory factory)
    {
        _factory = factory;
        
        _scopeFactory = _factory.Services.GetRequiredService<IServiceScopeFactory>();

        // Clean up the database before each test
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
        db.Client.DropDatabase("TestDb");
    }

    [Fact]
    public async Task SaveWord_WhenUserIsStandardAndAtLimit_ShouldReturnForbidden()
    {
        // --- ARRANGE ---
        var client = _factory.CreateClient();
        
        // create a scope to access the database
        using (var scope = _scopeFactory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
            var usersCollection = db.GetCollection<User>("users");
            var testUser = new User { AuthId = "test-auth-id", Role = "standard", WordCount = 10 };
            await usersCollection.InsertOneAsync(testUser);
        }
        
        var wordToSave = new SaveWordRequest("mot_numero_11", Array.Empty<ExamplePairDto>());
        
        
        // --- ACT ---
        var response = await client.PostAsJsonAsync("/api/personalwords", wordToSave);
        
        // --- ASSERT ---
        Assert.Equal(System.Net.HttpStatusCode.Forbidden, response.StatusCode);
    } 
    
    [Fact]
    public async Task SaveWord_WhenUserIsStandardAndWithinLimit_ShouldReturnOk()
    {
        // --- ARRANGE ---
        var client = _factory.CreateClient();
        
        // create a scope to access the database and 
        using (var scope = _scopeFactory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
            var usersCollection = db.GetCollection<User>("users");
            var testUser = new User { AuthId = "test-auth-id", Role = "standard", WordCount = 5 };
            await usersCollection.InsertOneAsync(testUser);
        }
        
        var wordToSave = new SaveWordRequest("mot_numero_6", Array.Empty<ExamplePairDto>());
        
        
        // --- ACT ---
        var response = await client.PostAsJsonAsync("/api/personalwords", wordToSave);
        
        // --- ASSERT ---
        try
        {
            response.EnsureSuccessStatusCode();
        }
        catch (HttpRequestException ex)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Request failed with status code {response.StatusCode}. Response content: {errorContent}", ex);
        }
        
        var savedWord = await response.Content.ReadFromJsonAsync<PersonalWord>();
        
        Assert.NotNull(savedWord);
        Assert.Equal("mot_numero_6", savedWord.Word);
        
        using (var scope = _scopeFactory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
            var usersCollection = db.GetCollection<User>("users");
            var updatedUser = await usersCollection.Find(u => u.AuthId == "test-auth-id").SingleAsync();
            Assert.Equal(6, updatedUser.WordCount);
        }
    }
}