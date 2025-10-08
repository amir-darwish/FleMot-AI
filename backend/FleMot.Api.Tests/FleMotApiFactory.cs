using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using MongoDB.Driver;
using Xunit;

namespace FleMot.Api.Tests;

public class FleMotApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly IContainer _mongoDbContainer = new ContainerBuilder()
        .WithImage("mongo:7.0")
        .WithPortBinding(27017, true)
        .WithWaitStrategy(Wait.ForUnixContainer().UntilInternalTcpPortIsAvailable(27017))
        .Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll(typeof(IMongoClient));
            services.RemoveAll(typeof(IMongoDatabase));

            var connectionString = $"mongodb://127.0.0.1:{_mongoDbContainer.GetMappedPublicPort(27017)}";
            services.AddSingleton<IMongoClient>(_ => new MongoClient(connectionString));
            services.AddScoped(sp => sp.GetRequiredService<IMongoClient>().GetDatabase("TestDb"));
        });
    }

    public HttpClient CreateClientWithServices(Action<IServiceCollection> servicesConfiguration)
    {
        return WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(servicesConfiguration);
        }).CreateClient();
    }

    public async Task InitializeAsync() => await _mongoDbContainer.StartAsync();
    public new async Task DisposeAsync() => await _mongoDbContainer.StopAsync();
}