using Application.Abstracts.Services.ExternalServices;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Text;

namespace Infrastructure.Services.ExternalServices
{
    public class GrokService : IGeminiService // Mevcut arayüzü koruyoruz ki diğer servisleri bozmayalım
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _model;

        public GrokService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Grok:ApiKey"]?.Trim() ?? "";
            _model = configuration["Grok:Model"]?.Trim() ?? "grok-2-1212";
        }

        public async Task<string> GenerateContentAsync(string systemPrompt, List<(string role, string content)> messages)
        {
            var url = "https://api.x.ai/v1/responses";
            
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            var input = new List<object>();

            // Sistem talimatını en başa ekle
            if (!string.IsNullOrEmpty(systemPrompt))
            {
                input.Add(new { role = "system", content = systemPrompt });
            }

            // Mesajları ekle
            foreach (var msg in messages)
            {
                input.Add(new { role = msg.role, content = msg.content });
            }

            var requestBody = new
            {
                model = _model,
                input = input,
                stream = false
            };

            var json = JsonConvert.SerializeObject(requestBody);
            var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, httpContent);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Grok API hatası ({response.StatusCode}): {responseContent}");
            }

            dynamic result = JsonConvert.DeserializeObject(responseContent)!;
            
            // xAI /v1/responses yanıt yapısı biraz farklıdır
            // Genelde result.message.content veya result.choices[0].message.content şeklindedir
            // En güncel yapıya göre parse edelim:
            try 
            {
                return result.message.content;
            }
            catch 
            {
                return result.choices[0].message.content;
            }
        }
        public Task<string> AnalyzeImageAsync(string systemPrompt, string base64Image)
        {
            throw new NotImplementedException("Grok Vision API is not configured. We are using Mistral.");
        }
    }
}
