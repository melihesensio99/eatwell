using Application.DTOs.Chat;

namespace Application.Abstracts.Services
{
    public interface IAiChatService
    {
        Task<ChatResponseDto> AskAsync(ChatRequestDto request);
    }
}
