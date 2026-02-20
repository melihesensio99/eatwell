namespace Application.Helpers
{
    public static class AllergenDictionary
    {
        private static readonly Dictionary<string, (string TurkishName, string Emoji)> Allergens = new()
        {
            { "en:milk", ("Süt", "🥛") },
            { "en:gluten", ("Gluten", "🌾") },
            { "en:soybeans", ("Soya", "🫘") },
            { "en:nuts", ("Kuruyemiş", "🥜") },
            { "en:eggs", ("Yumurta", "🥚") },
            { "en:fish", ("Balık", "🐟") },
            { "en:peanuts", ("Yer Fıstığı", "🥜") },
            { "en:celery", ("Kereviz", "🥬") },
            { "en:mustard", ("Hardal", "🟡") },
            { "en:sesame-seeds", ("Susam", "🌰") },
            { "en:sulphur-dioxide-and-sulphites", ("Sülfitler", "⚗️") },
            { "en:lupin", ("Acı Bakla", "🌱") },
            { "en:molluscs", ("Yumuşakçalar", "🐚") },
            { "en:crustaceans", ("Kabuklu Deniz Ürünleri", "🦐") },
        };
        public static Dictionary<string, (string TurkishName, string Emoji)> GetAll() => Allergens;

        public static string GetTurkishName(string allergenKey)
        {
            var normalizedKey = allergenKey.ToLower().Trim();
            return Allergens.TryGetValue(normalizedKey, out var info) ? info.TurkishName : allergenKey;
        }

        public static List<string> FindMatchingAllergens(string[]? productAllergens, string? allergensString, List<string> userAllergens)
        {
            var detected = new List<string>();

            if (userAllergens == null || userAllergens.Count == 0)
                return detected;

            foreach (var userAllergen in userAllergens)
            {
                var normalizedUser = userAllergen.ToLower().Trim();
                bool found = false;

       
                if (productAllergens != null)
                {
                    foreach (var productAllergen in productAllergens)
                    {
                        var normalizedProduct = productAllergen.ToLower().Trim();
                       
                        
       
                        if (normalizedProduct == normalizedUser)
                        {
                            found = true;
                            break;
                        }

                      
                        if (normalizedProduct.Contains(normalizedUser) || normalizedUser.Contains(normalizedProduct))
                        {
                            found = true;
                            break;
                        }
                    }
                }

                
                if (!found && !string.IsNullOrEmpty(allergensString))
                {
                   
                    var normalizedString = allergensString.ToLower();
                    
                 
                    
                    if (normalizedString.Contains(normalizedUser))
                    {
                        found = true;
                    } 
                    else 
                    {
                      
                        var coreName = normalizedUser.Replace("en:", "").Trim();
                        if (!string.IsNullOrEmpty(coreName) && normalizedString.Contains(coreName))
                        {
                            found = true;
                        }
                    }
                }

                if (found)
                {
                    detected.Add(GetTurkishName(userAllergen));
                }
            }

            return detected.Distinct().ToList();
        }
    }
}
