namespace Application.Abstracts.Services.ExternalServices
{
    public interface IGeminiService
    {
        Task<string> GenerateContentAsync(string systemPrompt, List<(string role, string content)> messages);
        Task<string> AnalyzeImageAsync(string systemPrompt, string base64Image);
    }
}
