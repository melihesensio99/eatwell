namespace Application.DTOs.Chat
{
    public class ChatRequestDto
    {
        public string DeviceId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public List<ChatMessageDto>? History { get; set; }
    }
}
