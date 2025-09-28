using System.Net;
using System.Net.Http.Json;
using FleMot.Api.Models.DTOs;
using FleMot.Api.Models.Entites;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using Xunit;

namespace FleMot.Api.Tests;

[Collection("Sequential")]
public class PersonalWordsControllerTests : IClassFixture<FleMotApiFactory>, IAsyncLifetime
{
    private readonly FleMotApiFactory _factory;
    private readonly IServiceScopeFactory _scopeFactory;

    public PersonalWordsControllerTests(FleMotApiFactory factory)
    {
        _factory = factory;
        _scopeFactory = _factory.Services.GetRequiredService<IServiceScopeFactory>();
    }

   // This method runs before each test to ensure a clean database state
    public async Task InitializeAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
        await db.Client.DropDatabaseAsync("TestDb");
    }

    public Task DisposeAsync() => Task.CompletedTask;

    private HttpClient CreateAuthenticatedClient()
    {
        return _factory.CreateClientWithServices(services =>
        {
            services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
        });
    }

    [Fact]
    public async Task SaveWord_WhenUserIsStandardAndAtLimit_ShouldReturnForbidden()
    {
        var client = CreateAuthenticatedClient();
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
        await db.GetCollection<User>("users")
            .InsertOneAsync(new User { AuthId = "test-auth-id", Role = "standard", WordCount = 10 });

        var response = await client.PostAsJsonAsync("/api/personalwords",
            new SaveWordRequest("mot_numero_11", Array.Empty<ExamplePairDto>()));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task SaveWord_WhenUserIsStandardAndWithinLimit_ShouldReturnOk()
    {
        var client = CreateAuthenticatedClient();
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
        await db.GetCollection<User>("users")
            .InsertOneAsync(new User { AuthId = "test-auth-id", Role = "standard", WordCount = 5 });

        var response = await client.PostAsJsonAsync("/api/personalwords",
            new SaveWordRequest("mot_numero_6", Array.Empty<ExamplePairDto>()));

        var body = await response.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var savedWord = await response.Content.ReadFromJsonAsync<PersonalWord>();
        Assert.NotNull(savedWord);
        Assert.Equal("mot_numero_6", savedWord.Word);
    }

    [Fact]
    public async Task SaveWord_WhenUserIsPremiumAndOverLimit_ShouldReturnOk()
    {
        var client = CreateAuthenticatedClient();
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
        await db.GetCollection<User>("users")
            .InsertOneAsync(new User { AuthId = "test-auth-id", Role = "premium", WordCount = 50 });

        var response = await client.PostAsJsonAsync("/api/personalwords",
            new SaveWordRequest("mot_numero_51", Array.Empty<ExamplePairDto>()));

        var body = await response.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var savedWord = await response.Content.ReadFromJsonAsync<PersonalWord>();
        Assert.NotNull(savedWord);
        Assert.Equal("mot_numero_51", savedWord.Word);
    }

    [Fact]
    public async Task SaveWord_WhenWordIsDuplicate_ShouldReturnConflict()
    {
        // --- ARRANGE ---
        var client = CreateAuthenticatedClient(); 

       // add a test user to the database
        using (var scope = _scopeFactory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
            var usersCollection = db.GetCollection<User>("users");

            var testUser = new User
            {
                AuthId = "test-auth-id",
                Role = "standard",
                WordCount = 0
            };
            await usersCollection.InsertOneAsync(testUser);
        }

        // --- ACT ---
        var firstResponse = await client.PostAsJsonAsync("/api/personalwords",
            new SaveWordRequest("mot_existant", Array.Empty<ExamplePairDto>()));
        var firstBody = await firstResponse.Content.ReadAsStringAsync();
        //Console.WriteLine($"=== First POST === Status: {firstResponse.StatusCode}, Body: {firstBody}");
        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);

        // --- ACT ---
        var secondResponse = await client.PostAsJsonAsync("/api/personalwords",
            new SaveWordRequest("mot_existant", Array.Empty<ExamplePairDto>()));
        var secondBody = await secondResponse.Content.ReadAsStringAsync();
        //Console.WriteLine($"=== Second POST === Status: {secondResponse.StatusCode}, Body: {secondBody}");

        // --- ASSERT ---
        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);
    }

}
