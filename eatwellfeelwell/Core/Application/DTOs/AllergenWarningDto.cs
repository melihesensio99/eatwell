namespace Application.DTOs
{
    public class AllergenWarningDto
    {
        public bool HasAllergenWarning { get; set; }
        public List<string> DetectedAllergens { get; set; } = new();
    }
}
