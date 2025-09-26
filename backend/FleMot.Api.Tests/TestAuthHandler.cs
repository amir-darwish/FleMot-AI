using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace FleMot.Api.Tests;

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder) 
        : base(options, logger, encoder) { }
    
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // create list of claims for a fake user
        var claims = new[] { 
            new Claim(ClaimTypes.NameIdentifier, "test-auth-id"), // this is Fake UserId
            new Claim(ClaimTypes.Name, "Test User"), 
        };
        
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");

        // return success result with ticket
        var result = AuthenticateResult.Success(ticket);

        return Task.FromResult(result);
    }

}