using FleMot.Api.Models.Gemini;
using System.Text;
using System.Text.Json;
using FleMot.Api.Models.DTOs;
using FleMot.Api.Models.Entites;

namespace FleMot.Api.Services;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    
    public GeminiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<ExamplePairDto[]> GetExamplesAsync(string word, int exampleCount, string language = "English")
    {
        var apiKey = _configuration["GEMINI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("Gemini API Key is not configured.");
        }
        var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={apiKey}";
        
        var prompt = $"Pour le mot français '{word}', génère {exampleCount} phrases d'exemples avec leur traduction en {language}. " +
                     $"**Si le mot '{word}' n'est pas un mot français valide, retourne un objet JSON avec une seule clé 'error' contenant le message 'Le mot n''est pas français.'.** " +
                     $"Sinon, fournis la réponse uniquement sous la forme d'un objet JSON contenant un tableau (array) nommé 'examples'. Chaque objet dans le tableau doit avoir deux clés : 'sentence' et 'translation'.";        

        
        var requestBody = new GeminiRequest(
            new Content[] { new Content(new Part[] { new Part(prompt) }) }
        );
        
        // Send the request
        var jsonContent = JsonSerializer.Serialize(requestBody);
        var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");
        
        var response = await _httpClient.PostAsync(apiUrl, httpContent);
        //Read result
        response.EnsureSuccessStatusCode();
        var jsonResponse = await response.Content.ReadAsStringAsync();

        try
        {
            
            using var doc = JsonDocument.Parse(jsonResponse);
        
            var rawText = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "{}";
        
            var cleanedJson = rawText.Trim().Replace("```json", "").Replace("```", "").Trim();
            if (cleanedJson.Contains("\"error\""))
            {
                throw new ArgumentException("Le mot fourni n'est pas un mot français valide.");
            }
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var examplesDto = JsonSerializer.Deserialize<ExamplesDto>(cleanedJson, options);

            return examplesDto?.Examples ?? Array.Empty<ExamplePairDto>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error parsing Gemini response: {ex.Message}");
            return Array.Empty<ExamplePairDto>();
        }
    }
    
}