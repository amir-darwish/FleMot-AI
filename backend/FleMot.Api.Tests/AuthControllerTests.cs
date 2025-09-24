using System.Net;
using System.Net.Http;
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
}