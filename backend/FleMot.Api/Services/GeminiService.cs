using FleMot.Api.Models.Gemini;
using System.Text;
using System.Text.Json;
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

    public async Task<string> GetExamplesAsync(string word, int exampleCount)
    {
        var apiKey = _configuration["GEMINI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("Gemini API Key is not configured.");
        }
        var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={apiKey}";
        
        var prompt = $"Pour le mot français '{word}', génère {exampleCount} phrases d'exemples simples et pertinentes. Fournis la réponse sous forme d'un objet JSON contenant une liste nommée 'examples'.";
        
        

        
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
        
        var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(jsonResponse);

        
        var rawText = geminiResponse?.candidates?.FirstOrDefault()?.content?.parts?.FirstOrDefault()?.text ?? "{}";


        var cleanedJson = rawText.Trim().Replace("```json", "").Replace("```", "").Trim();

        using var jsonDoc = JsonDocument.Parse(cleanedJson);
        var examplesNode = jsonDoc.RootElement.GetProperty("examples");

        var finalResult = string.Join("\n", examplesNode.EnumerateArray().Select(e => e.GetString() ?? ""));

        return finalResult;

    }
    
}