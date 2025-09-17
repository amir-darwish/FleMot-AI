using Moq;
using Moq.Contrib.HttpClient;
using System.Net;
using System.Text.Json;
using FleMot.Api.Services;
using FleMot.Api.Models.Gemini; // Assurez-vous d'importer vos modèles
using Microsoft.Extensions.Configuration;

namespace FleMot.Api.Tests;

public class GeminiServiceTests
{
    [Fact] // Ceci est un attribut qui marque cette méthode comme un test xUnit.
    public async Task GetExamplesAsync_ShouldReturnText_WhenApiCallIsSuccessful()
    {
        // --- ARRANGE (Préparation) ---

        // 1. Simuler la configuration pour l'API Key.
        var mockConfiguration = new Mock<IConfiguration>();
        // On configure le mock pour qu'il retourne une fausse clé API.
        mockConfiguration.Setup(config => config["GEMINI_API_KEY"]).Returns("fake-api-key");

        // 2. Créer une fausse réponse JSON que Gemini est censé retourner.
        var fakeApiResponse = new GeminiResponse(
            new Candidate[]
            {
                new Candidate(new Content(new Part[] { new Part("Voici vos exemples.") }))
            }
        );
        var fakeJsonPayload = JsonSerializer.Serialize(fakeApiResponse);

        // 3. Configurer le HttpClient simulé (le "mock").
        var handler = new Mock<HttpMessageHandler>();
        var httpClient = handler.CreateClient();

        // On programme le mock : "Quand un appel POST est fait à cette URL,
        // réponds avec le statut 200 OK et le contenu JSON que nous avons créé."
        handler.SetupRequest(HttpMethod.Post, "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=fake-api-key")
               .ReturnsResponse(HttpStatusCode.OK, new StringContent(fakeJsonPayload));

        // 4. Créer une instance de notre service, mais en lui donnant nos objets simulés.
        var geminiService = new GeminiService(httpClient, mockConfiguration.Object);

        
        // --- ACT (Action) ---

        // On exécute la méthode que l'on veut tester.
        var result = await geminiService.GetExamplesAsync("bonjour", 2);


        // --- ASSERT (Vérification) ---

        // On vérifie que le résultat obtenu est bien celui que l'on attendait.
        Assert.NotNull(result);
        Assert.Equal("Voici vos exemples.", result);
        
        // Bonus : On peut même vérifier que l'appel API a bien été effectué une fois.
        handler.VerifyRequest(HttpMethod.Post, "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=fake-api-key", Times.Once());
    }
}