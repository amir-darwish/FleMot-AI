using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace FleMot.Api.Tests;

public class FleMotApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
   // use Testcontainers in Docker to create a MongoDB container for testing
    private readonly IContainer _mongoDbContainer = new ContainerBuilder()
        .WithImage("mongo:7.0")
        .WithPortBinding(27017, true) 
        .WithWaitStrategy(Wait.ForUnixContainer().UntilInternalTcpPortIsAvailable(27017))
        .Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            // remove existing MongoDB registrations
            services.RemoveAll(typeof(IMongoClient));
            services.RemoveAll(typeof(IMongoDatabase));

            // 1. add new MongoDB registrations pointing to the test container
            var mongoPort = _mongoDbContainer.GetMappedPublicPort(27017);
    
            // 2. Build the connection string manually
            var connectionString = $"mongodb://127.0.0.1:{mongoPort}";

            // 3. Add the services using the correct connection string
            services.AddSingleton<IMongoClient>(sp => new MongoClient(connectionString));
            services.AddScoped<IMongoDatabase>(sp => 
                sp.GetRequiredService<IMongoClient>().GetDatabase("TestDb"));

            // remove JWT authentication and add a test authentication scheme
            services.RemoveAll(typeof(JwtBearerHandler));
            services.RemoveAll(typeof(IConfigureOptions<JwtBearerOptions>));
            services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
        });
    }

    // start and stop the test container
    public async Task InitializeAsync() => await _mongoDbContainer.StartAsync();
    public new async Task DisposeAsync() => await _mongoDbContainer.StopAsync();
}