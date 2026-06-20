using Application.Abstracts.Services.ExternalServices;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Text;

namespace Infrastructure.Services.ExternalServices
{
    public class MistralService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _model;

        public MistralService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Mistral:ApiKey"]?.Trim() ?? "";
            _model = configuration["Mistral:Model"]?.Trim() ?? "mistral-large-latest";
        }

        public async Task<string> GenerateContentAsync(string systemPrompt, List<(string role, string content)> messages)
        {
            var url = "https://api.mistral.ai/v1/chat/completions";
            
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            var messagesList = new List<object>();

            // Sistem talimatı
            if (!string.IsNullOrEmpty(systemPrompt))
            {
                messagesList.Add(new { role = "system", content = systemPrompt });
            }

            // Diğer mesajlar
            foreach (var msg in messages)
            {
                messagesList.Add(new { role = msg.role, content = msg.content });
            }

            var requestBody = new
            {
                model = _model,
                messages = messagesList,
                temperature = 0.7,
                max_tokens = 1024
            };

            var json = JsonConvert.SerializeObject(requestBody);
            var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, httpContent);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Mistral AI hatası ({response.StatusCode}): {responseContent}");
            }

            dynamic result = JsonConvert.DeserializeObject(responseContent)!;
            string reply = result.choices[0].message.content;

            return reply;
        }
        public async Task<string> AnalyzeImageAsync(string systemPrompt, string base64Image)
        {
            var url = "https://api.mistral.ai/v1/chat/completions";
            
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            var modelToUse = "pixtral-12b-2409"; 

            var messagesList = new List<object>();

            if (!string.IsNullOrEmpty(systemPrompt))
            {
                messagesList.Add(new { role = "system", content = systemPrompt });
            }

            var imageUrl = base64Image.StartsWith("data:image") ? base64Image : $"data:image/jpeg;base64,{base64Image}";

            messagesList.Add(new {
                role = "user",
                content = new object[]
                {
                    new { type = "text", text = "Lütfen görseldeki ürünü analiz et ve istenilen formatta yanıtla." },
                    new { type = "image_url", image_url = imageUrl }
                }
            });

            var requestBody = new
            {
                model = modelToUse,
                messages = messagesList,
                temperature = 0.2,
                max_tokens = 1000
            };

            var json = JsonConvert.SerializeObject(requestBody);
            var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, httpContent);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Mistral Vision API hatası ({response.StatusCode}): {responseContent}");
            }

            dynamic result = JsonConvert.DeserializeObject(responseContent)!;
            string reply = result.choices[0].message.content;

            return reply;
        }
    }
}
