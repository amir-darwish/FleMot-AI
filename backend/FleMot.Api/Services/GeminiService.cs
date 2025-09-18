using FleMot.Api.Models.Gemini;
using System.Text;
using System.Text.Json;
using FleMot.Api.Models.DTOs;
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

    public async Task<ExamplePairDto[]> GetExamplesAsync(string word, int exampleCount)
    {
        var apiKey = _configuration["GEMINI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("Gemini API Key is not configured.");
        }
        var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={apiKey}";
        
        var prompt = $"Pour le mot français '{word}', génère {exampleCount} phrases d'exemples. Pour chaque phrase, fournis aussi une traduction en English. Fournis la réponse **uniquement sous la forme d'un objet JSON** contenant un tableau (array) nommé 'examples'. Chaque objet dans le tableau doit avoir deux clés : 'sentence' pour la phrase en français, et 'translation' pour la traduction en English.";        
        

        
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