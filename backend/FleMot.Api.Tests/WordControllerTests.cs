using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FleMot.Api.Models.DTOs;
using FleMot.Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace FleMot.Api.Tests;

public class WordsControllerTests : IClassFixture<FleMotApiFactory>
{
    private readonly FleMot.Api.Tests.FleMotApiFactory _factory;
    
    public WordsControllerTests(FleMot.Api.Tests.FleMotApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task SearchWord_WithValidRequest_ShouldReturnOkWithExamples()
    {
        // --- ARRANGE ---
        
        // 1. Créer une simulation de notre service de recherche
        var mockWordSearchService =  new Mock<IWordSearchService>();
        var fakeExamples = new[]
        {
            new ExamplePairDto("Ceci est un test", "This is a test")
        };
        
        // Programmer la simulation pour qu'elle retourne nos faux exemples
        mockWordSearchService
            .Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(fakeExamples);

        // 2. Créer un client HTTP configuré pour ce test spécifique
        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                // Remplacer le vrai service par notre simulation
                services.AddScoped(_ => mockWordSearchService.Object);
                // Ajouter l'authentification de test pour que la requête soit autorisée
                services.AddAuthentication("Test")
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
            });
        }).CreateClient();
        
        var requestData = new SearchRequest("test");
        
        // --- ACT ---
        var response = await client.PostAsJsonAsync("/api/words/search", requestData);
        
        // --- ASSERT ---
        response.EnsureSuccessStatusCode(); // Vérifie que le statut est 2xx
        
        var responseData = await response.Content.ReadFromJsonAsync<SearchResponse>();
        Assert.NotNull(responseData);
        Assert.Single(responseData.Examples);
        Assert.Equal("Ceci est un test", responseData.Examples[0].Sentence);
    }
    
    // Ce record aide à désérialiser la réponse JSON
    public record SearchResponse(string Word, ExamplePairDto[] Examples);
}