namespace Domain.Entities
{
    public class UserAllergen
    {
        public int Id { get; set; }
        public string DeviceId { get; set; } = string.Empty;
        public string AllergenKey { get; set; } = string.Empty; // "en:milk", "en:gluten" 
    }
}
