namespace Application.DTOs
{
    public class SetUserAllergensDto
    {
        public string DeviceId { get; set; } = string.Empty;
        public List<string> AllergenKeys { get; set; } = new();
    }
}
