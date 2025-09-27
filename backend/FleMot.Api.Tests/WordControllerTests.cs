using System.Net;
using System.Net.Http.Json;
using FleMot.Api.Models.DTOs;
using FleMot.Api.Services;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace FleMot.Api.Tests;

public class WordControllerTests : IClassFixture<FleMotApiFactory>
{
    private readonly FleMotApiFactory _factory;
    
    public WordControllerTests(FleMotApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task SearchWord_WithValidRequest_ShouldReturnOkWithExamples()
    {
        // --- ARRANGE ---
        var mockWordSearchService =  new Mock<IWordSearchService>();

        var fakeExamples = new[]
        {
            new ExamplePairDto("Ceci est un test", "This is a test")
        };
        
        mockWordSearchService
            .Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(fakeExamples);

        var client = _factory.CreateClientWithServices(services =>
        {
            services.AddScoped(_ => mockWordSearchService.Object);
        });
        
        var requestData = new SearchRequest("test");
        
        // --- ACT ---
        var response = await client.PostAsJsonAsync("/api/words/search", requestData);
        
        // --- ASSERT ---
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseData = await response.Content.ReadFromJsonAsync<SearchResponse>();
        Assert.NotNull(responseData);
        Assert.Single(responseData.Examples);
        Assert.Equal("Ceci est un test", responseData.Examples[0].Sentence);
        
    }
    public record SearchResponse(string Word, ExamplePairDto[] Examples);

}