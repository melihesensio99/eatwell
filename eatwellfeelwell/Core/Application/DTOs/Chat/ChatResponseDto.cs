namespace Application.DTOs.Chat
{
    public class ChatResponseDto
    {
        public string Reply { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
