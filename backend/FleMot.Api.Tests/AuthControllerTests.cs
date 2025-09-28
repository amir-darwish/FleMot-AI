using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace FleMot.Api.Tests;

public class AuthControllerTests : IClassFixture<FleMotApiFactory>
{
    private readonly FleMotApiFactory _factory;

    public AuthControllerTests(FleMotApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task RegisterAsync_WithoutToken_ShouldReturnUnauthorized()
    {
        // ARRANGE
        // Create a standard client. Since the base factory doesn't
        // add the TestAuthHandler, this client is unauthenticated.
        var client = _factory.CreateClient();

        // ACT
        var response = await client.PostAsync("/api/auth/register", null);

        // ASSERT
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
    
    [Fact]
    public async Task RegisterAsync_WithValidToken_ShouldCreateUserAndReturnOk()
    {
        // ARRANGE
        // Create a special client for this test that INCLUDES the fake authentication handler.
        var client = _factory.CreateClientWithServices(services =>
        {
            services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
        });

        // ACT
        var response = await client.PostAsync("/api/auth/register", null);

        // ASSERT
        response.EnsureSuccessStatusCode();
    
        var user = await response.Content.ReadFromJsonAsync<User>(); 
    
        Assert.NotNull(user);
        Assert.Equal("test-auth-id", user.AuthId);
        Assert.Equal("standard", user.Role);
    }

    // This record helps deserialize the JSON response
    public record User(string Id, string AuthId, string Role, int WordCount);
}