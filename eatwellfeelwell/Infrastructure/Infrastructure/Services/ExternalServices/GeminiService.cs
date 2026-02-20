using Application.Abstracts.Services.ExternalServices;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Text;

namespace Infrastructure.Services.ExternalServices
{
    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _model;

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"]
                ?? throw new InvalidOperationException("Gemini API key bulunamadı. appsettings.json'a 'Gemini:ApiKey' ekleyin.");
            _model = configuration["Gemini:Model"] ?? "gemini-2.0-flash";
        }

        public async Task<string> GenerateContentAsync(string systemPrompt, List<(string role, string content)> messages)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

            var contents = new List<object>();

           
            foreach (var msg in messages)
            {
                contents.Add(new
                {
                    role = msg.role,   
                    parts = new[] { new { text = msg.content } }
                });
            }

            var requestBody = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = systemPrompt } }
                },
                contents = contents,
                generationConfig = new
                {
                    temperature = 0.7,
                    maxOutputTokens = 1024
                }
            };

            var json = JsonConvert.SerializeObject(requestBody);
            var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, httpContent);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Gemini API hatası ({response.StatusCode}): {responseContent}");
            }

            dynamic result = JsonConvert.DeserializeObject(responseContent)!;
            string reply = result.candidates[0].content.parts[0].text;

            return reply;
        }
    }
}
