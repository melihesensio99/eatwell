# Backend dış kaynak response envanteri

Bu not, mevcut backend kodu taranarak çıkarılmıştır. UI kapsam dışıdır. Amaç, yeni CQRS + Vertical Slice mimarisine geçerken dış kaynak kontratlarını kaybetmemektir.

## 1. Open Food Facts

Kaynak: `FoodApiClient`

Endpoint'ler:

- `GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
- `GET https://world.openfoodfacts.org/cgi/search.pl?...`

### Barkod response

Mevcut envelope:

- `code` → ürün barkodu
- `status` → ürün bulundu mu
- `status_verbose` → kaynak açıklaması
- `product` → ürün detayları

Kullanılan ürün alanları:

| Kaynak alanı | Mevcut kullanım | Hedef kullanım |
|---|---|---|
| `product.product_name` | Ürün adı | `Product.Name` |
| `product.image_front_url` | Ürün görseli | `Product.ImageUrl` |
| `product.nutriments.energy-kcal_100g` | Kalori ve günlük özet | `NutritionFacts.EnergyKcalPer100g` |
| `product.nutriments.proteins_100g` | Günlük özet | `NutritionFacts.ProteinPer100g` |
| `product.nutriments.fat_100g` | Günlük özet ve yüzde hesabı | `NutritionFacts.FatPer100g` |
| `product.nutriments.carbohydrates_100g` | Günlük özet ve yüzde hesabı | `NutritionFacts.CarbohydratesPer100g` |
| `product.nutriments.sugars_100g` | Ürün analizi | `NutritionFacts.SugarsPer100g` |
| `product.nutriments.saturated-fat_100g` | Ürün analizi | `NutritionFacts.SaturatedFatPer100g` |
| `product.nutriments.salt_100g` | Ürün analizi | `NutritionFacts.SaltPer100g` |
| `product.nutrient_levels.fat` | Sağlık skoru | `NutritionLevels.Fat` |
| `product.nutrient_levels.salt` | Sağlık skoru | `NutritionLevels.Salt` |
| `product.nutrient_levels.saturated-fat` | Sağlık skoru | `NutritionLevels.SaturatedFat` |
| `product.nutrient_levels.sugars` | Sağlık skoru | `NutritionLevels.Sugars` |
| `product.additives_n` | Şu an entity'de saklanıyor | Katkı özeti |
| `product.additives_tags` | Katkı açıklamaları ve AI prompt'u | `Additives` |
| `product.allergens_from_ingredients` | Alerjen eşleştirme | Alerjen analiz girdisi |
| `product.allergens_hierarchy` | Alerjen eşleştirme ve response | Alerjen analiz girdisi |
| `product.nova_group` | Sağlık skoru ve response | `NovaGroup` enum/value object |
| `product.quality_tags` | Entity'ye map ediliyor | Kalite metadata'sı |
| `product.nutrition_grades` | Sağlık skoru ve response | `NutriScore` |
| `product.nutrition_score_beverage` | Entity'ye map ediliyor | İçecek skor metadata'sı |

### Arama response

Envelope:

- `count` → toplam kayıt
- `page` → mevcut sayfa
- `page_size` → sayfa boyutu
- `products[]` → arama sonuçları

Arama sonucunda gerçekten kullanılan alanlar:

- `code`
- `product_name`
- `brands`
- `image_front_small_url`
- `nutrition_grades`
- `nutriments.energy-kcal_100g`

`nova_group` response DTO'sunda mevcut olmasına rağmen application response'una aktarılmıyor.

### Tespit edilen Open Food Facts riskleri

- `product`, `nutriments` ve `nutrient_levels` null gelebilir; mevcut mapping null güvenli değil.
- `status == 0` kontrolü açıkça yapılmıyor.
- Deserialize sonucu null olsa da client null olmayan tür döndürüyor.
- Arama sonuçları backend'de tekrar `ProductName.Contains(query)` ile filtreleniyor.
- `LogDate.Date` gibi DB tarafında non-sargable sorgu kullanımı mevcut; dış kaynak cache stratejisi de yok.
- External DTO'lar Application katmanında bulunuyor; yeni yapıda Infrastructure adapter modelleri olmalı.

## 2. Mistral AI

Kaynak: `MistralService`

Kullanılan endpoint:

- `POST https://api.mistral.ai/v1/chat/completions`

### Metin/chat response

İstek sonucundan yalnızca şu alan okunuyor:

```text
choices[0].message.content
```

Kullanılan çıktı:

- Chat cevabı
- Ürün analiz açıklaması

Kullanılmayan ancak response'ta bulunabilecek metadata:

- `id`
- `model`
- `created`
- `usage.prompt_tokens`
- `usage.completion_tokens`
- `usage.total_tokens`
- `finish_reason`

Yeni yapıda bu metadata en azından loglama, maliyet takibi ve hata analizi için typed response'a alınmalı.

### Görsel analiz response

Yine `choices[0].message.content` okunuyor. Bu içerik modelden JSON olarak isteniyor ve sonrasında `ProductAnalysisDto` içine deserialize ediliyor.

Beklenen AI JSON alanları:

- `productName`
- `imageFrontUrl`
- `novaGroup`
- `nutritionGrades`
- `additivesTags[]`
- `allergensHierarchy[]`
- `fat`
- `salt`
- `saturatedFat`
- `sugars`
- `proteins`
- `carbohydrates`
- `energyKcal`
- `score`
- `isHealthy`
- `aiAnalysis`

### Tespit edilen Mistral riskleri

- Response `dynamic` ile parse ediliyor.
- `choices` boşsa veya `message.content` yoksa kontrollü hata oluşmuyor.
- JSON markdown fence temizliği string replace ile yapılıyor.
- AI çıktısı doğrudan güvenilir nutrition data gibi kabul ediliyor.
- Görsel analiz için model adı kod içine sabitlenmiş: `pixtral-12b-2409`.
- Token kullanımı, provider latency ve correlation id kaydedilmiyor.
- Base64 görsel için boyut, MIME type ve payload limiti doğrulanmıyor.

## 3. Kapsam dışı provider'lar

Gemini ve Grok şu an gerekli olmadığı için yeni backend'e taşınmayacak. Mevcut repodaki sınıflar yalnızca eski uygulamanın referans kodu olarak duruyor.

### Gemini — taşınmayacak

Kaynak: `GeminiService`

Endpoint:

- `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}`

Metin response'undan okunan alan:

```text
candidates[0].content.parts[0].text
```

Görsel analiz metodu `NotImplementedException` döndürüyor. Yeni backend'te Gemini abstraction veya registration oluşturulmayacak.

### Grok / xAI — taşınmayacak

Kaynak: `GrokService`

Endpoint:

- `POST https://api.x.ai/v1/responses`

Response için iki alternatif parse deneniyor:

- `message.content`
- `choices[0].message.content`

Görsel analiz uygulanmamış. Yeni backend'te Grok abstraction veya registration oluşturulmayacak.

## 5. Yeni mimaride önerilen response sınırları

Dış kaynak response'u hiçbir zaman doğrudan API response'u veya Domain entity'si olmamalı.

```text
External Provider Response
        ↓
Infrastructure Adapter / Mapper
        ↓
Application Result / Domain Model
        ↓
API Response
```

Yeni backend'te yalnızca gerekli provider modelleri oluşturulacak:

- `OpenFoodFactsProductResponse`
- `OpenFoodFactsSearchResponse`
- `MistralChatCompletionResponse`
- `AiVisionAnalysisResponse`
- `ExternalServiceError`
- `NutritionFacts`
- `AllergenInformation`
- `AdditiveInformation`

CQRS feature'ları dış kaynakları şu şekilde kullanmalı:

- `GetProductByBarcodeQueryHandler` → OpenFoodFacts adapter
- `SearchProductsQueryHandler` → OpenFoodFacts adapter
- `AnalyzeFoodImageCommandHandler` → AI vision adapter
- `AskNutritionAssistantCommandHandler` → AI text adapter

Handler'lar provider response modelini bilmemeli; sadece application abstraction/result modelini kullanmalı.
