namespace API.Const
{
    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Detail { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Path { get; set; } = string.Empty;
    }
}
