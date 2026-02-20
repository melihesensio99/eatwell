using Application.Abstracts.Services;
using Application.DTOs.Chat;
using Microsoft.AspNetCore.SignalR;

namespace API.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IAiChatService _aiChatService;

        public ChatHub(IAiChatService aiChatService)
        {
            _aiChatService = aiChatService;
        }

        public async Task SendMessage(string deviceId, string message, List<ChatMessageDto>? history)
        {
            await Clients.Caller.SendAsync("ReceiveTyping", true);

            try
            {
                var request = new ChatRequestDto
                {
                    DeviceId = deviceId,
                    Message = message,
                    History = history
                };

                var response = await _aiChatService.AskAsync(request);

                await Clients.Caller.SendAsync("ReceiveMessage", response.Reply, response.Timestamp);
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("ReceiveError", ex.Message);
            }
            finally
            {
                await Clients.Caller.SendAsync("ReceiveTyping", false);
            }
        }

        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("ReceiveMessage", "Merhaba! Ben EatWell beslenme asistanınız. Size nasıl yardımcı olabilirim? 🥗", DateTime.UtcNow);
            await base.OnConnectedAsync();
        }
    }
}
