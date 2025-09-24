using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Mongo2Go;
using MongoDB.Driver;

namespace FleMot.Api.Tests;

public class FleMotApiFactory : WebApplicationFactory<Program>, IDisposable
{
    private MongoDbRunner? _mongoDbRunner;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Lancer une instance MongoDB en mémoire
        _mongoDbRunner = MongoDbRunner.Start();

        builder.ConfigureServices(services =>
        {
            // D'abord, on retire l'ancienne configuration de MongoDB
            services.RemoveAll(typeof(IMongoClient));
            services.RemoveAll(typeof(IMongoDatabase));

            // Ensuite, on ajoute la nouvelle configuration qui pointe vers notre BDD de test
            services.AddSingleton<IMongoClient>(sp => new MongoClient(_mongoDbRunner.ConnectionString));
            services.AddScoped<IMongoDatabase>(sp => 
                sp.GetRequiredService<IMongoClient>().GetDatabase("TestDb")
            );
        });
    }

    // S'assurer que la base de données de test est bien arrêtée à la fin
    public new void Dispose()
    {
        _mongoDbRunner?.Dispose();
        base.Dispose();
    }
}