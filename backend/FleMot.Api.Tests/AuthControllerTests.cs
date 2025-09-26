using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace FleMot.Api.Tests;

public class AuthControllerTests : IClassFixture<FleMotApiFactory>
{
    private readonly HttpClient _client;

    public AuthControllerTests(FleMotApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task RegisterAsync_WithoutToken_ShouldReturnUnauthorized()
    {
        // --- ARRANGE --- 
        
        // empty setup as no token is provided //


        // --- ACT  ---
        var response = await _client.PostAsync("/api/auth/register", null);

        // --- ASSERT ---
     
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
    
    [Fact]
    public async Task RegisterAsync_WithValidToken_ShouldCreateUserAndReturnOk()
    {
        // --- ARRANGE ---
        
        // we use a fake handler that automatically authenticates the request
        

        // --- ACT ---

        var response = await _client.PostAsync("/api/auth/register", null);

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
    
        // read the user from the response
        var user = await response.Content.ReadFromJsonAsync<User>(); 
    
        Assert.NotNull(user);
        Assert.Equal("test-auth-id", user.AuthId);
        Assert.Equal("standard", user.Role);

    }

    public record User(string Id, string AuthId, string Role, int WordCount);
}