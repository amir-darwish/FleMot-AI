using Moq;
using Moq.Contrib.HttpClient;
using System.Net;
using System.Text.Json;
using FleMot.Api.Services;
using FleMot.Api.Models.DTOs; 
using FleMot.Api.Models.Gemini;
using Microsoft.Extensions.Configuration;

namespace FleMot.Api.Tests;

public class GeminiServiceTests
{
    [Fact]
    public async Task GetExamplesAsync_ShouldReturnCorrectDto_WhenApiCallIsSuccessful()
    {
        var mockConfiguration = new Mock<IConfiguration>();
        mockConfiguration.Setup(config => config["GEMINI_API_KEY"]).Returns("fake-api-key");

        var fakeExamplesDto = new ExamplesDto(new[]
        {
            new ExamplePairDto("Ceci est une phrase.", "This is a sentence.")
        });
        
        var fakeGeminiText = JsonSerializer.Serialize(fakeExamplesDto); 
        var fakeApiResponse = new GeminiResponse(
            new Candidate[] { new Candidate(new Content(new Part[] { new Part($"```json\n{fakeGeminiText}\n```") })) }
        );
        var fakeJsonPayload = JsonSerializer.Serialize(fakeApiResponse);
        
        var handler = new Mock<HttpMessageHandler>();
        var httpClient = handler.CreateClient();


        var expectedFullUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=fake-api-key";

        handler.SetupRequest(HttpMethod.Post, expectedFullUrl)
            .ReturnsResponse(HttpStatusCode.OK, new StringContent(fakeJsonPayload));
        var geminiService = new GeminiService(httpClient, mockConfiguration.Object);
        
        var result = await geminiService.GetExamplesAsync("test", 1);

        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Equal("Ceci est une phrase.", result[0].Sentence);
        Assert.Equal("This is a sentence.", result[0].Translation);
    }
}