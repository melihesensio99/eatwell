using Application.Abstracts.Services;
using Application.Abstracts.Services.ExternalServices;
using Application.DTOs.Chat;
using Application.Exceptions;

namespace Infrastructure.Services
{
    public class AiChatService : IAiChatService
    {
        private readonly IGeminiService _geminiService;
        private readonly IUserAllergenService _allergenService;
        private readonly IDailyLogService _dailyLogService;

        public AiChatService(
            IGeminiService geminiService,
            IUserAllergenService allergenService,
            IDailyLogService dailyLogService)
        {
            _geminiService = geminiService;
            _allergenService = allergenService;
            _dailyLogService = dailyLogService;
        }

        public async Task<ChatResponseDto> AskAsync(ChatRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.DeviceId))
                throw new ValidationException("DeviceId boş olamaz");
            if (string.IsNullOrWhiteSpace(request.Message))
                throw new ValidationException("Mesaj boş olamaz");
          
            var contextParts = new List<string>();

            try
            {
                var allergens = await _allergenService.GetUserAllergensAsync(request.DeviceId);
                if (allergens != null && allergens.Any())
                {
                    contextParts.Add($"Kullanıcının alerjenleri: {string.Join(", ", allergens)}");
                }
            }
            catch { }

            try
            {
                var summary = await _dailyLogService.GetDailySummaryAsync(request.DeviceId, DateTime.UtcNow);
                if (summary != null)
                {
                    contextParts.Add($"Bugünkü beslenme durumu: " +
                        $"Toplam kalori: {summary.TotalCalorie:F0} kcal, " +
                        $"Protein: {summary.TotalProtein:F1}g, " +
                        $"Yağ: {summary.TotalFat:F1}g, " +
                        $"Karbonhidrat: {summary.TotalCarb:F1}g");

                    if (summary.CalorieGoal.HasValue)
                    {
                        contextParts.Add($"Günlük kalori hedefi: {summary.CalorieGoal:F0} kcal, " +
                            $"Kalan: {summary.CalorieRemaining:F0} kcal");
                    }

                    if (summary.ConsumedItems != null && summary.ConsumedItems.Any())
                    {
                        var items = string.Join(", ", summary.ConsumedItems.Select(i => $"{i.ProductName} ({i.Calories:F0} kcal)"));
                        contextParts.Add($"Bugün yenenler: {items}");
                    }
                }
            }
            catch {  }

         
            var systemPrompt = BuildSystemPrompt(contextParts);

           
            var messages = new List<(string role, string content)>();

            if (request.History != null && request.History.Any())
            {
                foreach (var msg in request.History)
                {
                    messages.Add((msg.Role, msg.Content));
                }
            }

            messages.Add(("user", request.Message));

            var reply = await _geminiService.GenerateContentAsync(systemPrompt, messages);

            return new ChatResponseDto
            {
                Reply = reply,
                Timestamp = DateTime.UtcNow
            };
        }

        private string BuildSystemPrompt(List<string> contextParts)
        {
            var prompt = @"Sen EatWellFeelWell uygulamasının yapay zeka beslenme danışmanısın. 
Görevin kullanıcılara sağlıklı beslenme konusunda yardımcı olmak.

Kuralların:
- Türkçe yanıt ver.
- Kısa ve öz cevaplar ver, gereksiz uzatma.
- Beslenme, diyet, kalori, alerjenler ve sağlıklı yaşam hakkında bilgi ver.
- Tıbbi teşhis koyma, ciddi sağlık sorunları için doktora yönlendir.
- Kullanıcının alerjenlerine dikkat et, alerjik olduğu maddeleri içeren ürünleri önerme.
- Samimi ve destekleyici bir ton kullan.";

            if (contextParts.Any())
            {
                prompt += "\n\nKullanıcı hakkında bilgiler:\n";
                prompt += string.Join("\n", contextParts.Select(p => $"- {p}"));
            }

            return prompt;
        }
    }
}
