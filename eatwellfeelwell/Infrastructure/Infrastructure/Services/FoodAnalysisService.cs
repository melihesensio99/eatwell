using Application.Abstracts.Services;
using Application.Abstracts.Services.ExternalServices;
using Application.DTOs;
using Application.DTOs.ExternalDtos;
using Application.Exceptions;
using Application.Helpers;
using AutoMapper;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Application.Repositories;
namespace Infrastructure.Services
{
    public class FoodAnalysisService : IFoodAnalysisService
    {
        private readonly IProductService _productService;
        private readonly IUserAllergenService _allergenService;
        private readonly IGeminiService _geminiService;
        private readonly ICalorieGoalService _calorieGoalService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly IProductRepository _productRepository;

        public FoodAnalysisService(
            IProductService productService, 
            IUserAllergenService allergenService, 
            IGeminiService geminiService,
            ICalorieGoalService calorieGoalService,
            IMapper mapper,
            IConfiguration configuration,
            IProductRepository productRepository)
        {
            _productService = productService;
            _allergenService = allergenService;
            _geminiService = geminiService;
            _calorieGoalService = calorieGoalService;
            _mapper = mapper;
            _configuration = configuration;
            _productRepository = productRepository;
        }

        public async Task<ProductAnalysisDto> AnalyzeProduct(string barcode, string? deviceId = null)
        {
            try 
            {
                var result = await _productService.GetAndifExistSaveProductAsync(barcode);
                if (result == null) throw new NotFoundException("Ürün", barcode);

                // MANUEL MAPPING (AutoMapper hatasından kurtulmak için)
                var dto = new ProductAnalysisDto
                {
                    ProductName = result.ProductName,
                    ImageFrontUrl = result.ImageFrontUrl,
                    NovaGroup = result.NovaGroup,
                    NutritionGrades = result.NutritionGrades,
                    AdditivesTags = result.AdditivesTags,
                    Fat = result.Fat,
                    Salt = result.Salt,
                    SaturatedFat = result.SaturatedFat,
                    Sugars = result.Sugars,
                    EnergyKcal = result.EnergyKcal100g?.ToString() ?? "0",
                    Score = HealthScoreCalculator.Calculate(result)
                };
                dto.IsHealthy = dto.Score >= 70;
                dto.AdditiveDescriptions = AdditivesDictionary.GetDescriptions(result.AdditivesTags);

                // deviceId geçerli mi kontrol et
                bool isDeviceIdValid = !string.IsNullOrEmpty(deviceId) && deviceId.ToLower() != "null";

                if (isDeviceIdValid)
                {
                    try {
                        var userAllergens = await _allergenService.GetUserAllergensAsync(deviceId!);
                        var detected = AllergenDictionary.FindMatchingAllergens(
                            result.AllergensHierarchy, result.AllergensFromIngredients, userAllergens);
                        
                        dto.AllergenWarning = new AllergenWarningDto {
                            HasAllergenWarning = detected.Count > 0,
                            DetectedAllergens = detected
                        };
                    } catch { /* Alerjen hatası analizi durdurmasın */ }

                    try {
                        var mistralKey = _configuration["Mistral:ApiKey"];
                        if (!string.IsNullOrEmpty(mistralKey)) {
                            string additives = dto.AdditivesTags != null && dto.AdditivesTags.Length > 0 
                                ? string.Join(", ", dto.AdditivesTags) 
                                : "Bilinmiyor/Yok";
                                
                            string systemPrompt = @"Sen bir beslenme uzmanısın. Lütfen ürünü analiz et ve yanıtını sadece aşağıdaki başlıkları kullanarak, her biri yeni bir satırda olacak şekilde ver. Kesinlikle markdown (**, -, #) veya alt madde kullanma. Sadece 'Başlık: İçerik' formatında düz metin kullan.

Ürün Özeti: Ürünün ne olduğu hakkında 1-2 cümle.
Besin Değerleri: Kalori ve makro besinler hakkında kısa bilgi.
Nutri-Score ve Nova: İşlenmişlik seviyesi ve sağlık skoru değerlendirmesi.
İçerik ve Katkı Maddeleri: Üründeki e322 vb. tüm katkı maddelerinin tam olarak ne olduğunu, gıdaya neden eklendiğini, sağlığa olası zararlarını, yan etkilerini ve uzun vadeli risklerini çok daha ayrıntılı ve kapsamlı bir şekilde açıkla.
Sonuç: Tüketim için son tavsiyen.";

                            var messages = new List<(string role, string content)> { 
                                ("user", $"Ürün: {dto.ProductName}\nKatkı Maddeleri: {additives}\nLütfen bu ürünü yukarıdaki formata göre analiz et.") 
                            };
                            dto.AiAnalysis = await _geminiService.GenerateContentAsync(systemPrompt, messages);
                        }
                    } catch { /* AI hatası analizi durdurmasın */ }
                }

                return dto;
            }
            catch (Exception ex)
            {
                // HATAYI MOBİL UYGULAMAYA GÖNDER (Teşhis için)
                return new ProductAnalysisDto {
                    ProductName = "HATA OLUŞTU",
                    AiAnalysis = "Hata Detayı: " + ex.Message
                };
            }
        }

        public async Task<ProductAnalysisDto> AnalyzeImage(string base64Image, string? deviceId = null)
        {
            try
            {
                string systemPrompt = @"Sen bir beslenme uzmanı ve yapay zeka görüş asistanısın. Kullanıcının gönderdiği gıda veya yemek görselini analiz et. Yanıtın SADECE aşağıdaki JSON formatında olmalıdır. Başka hiçbir açıklama, markdown (```json) veya metin ekleme. JSON yapısı:
{
  ""productName"": ""Tahmini Ürün/Yemek Adı"",
  ""imageFrontUrl"": null,
  ""novaGroup"": 1,
  ""nutritionGrades"": ""a"",
  ""additivesTags"": [],
  ""allergensHierarchy"": [],
  ""fat"": ""10"",
  ""salt"": ""1.0"",
  ""saturatedFat"": ""3.0"",
  ""sugars"": ""5.0"",
  ""proteins"": ""8.0"",
  ""carbohydrates"": ""25.0"",
  ""energyKcal"": ""250"",
  ""score"": 85,
  ""isHealthy"": true,
  ""aiAnalysis"": ""Lütfen ürünü analiz et ve yanıtını sadece şu başlıkları kullanarak ver (gerçek satır atlama kullanma, alt satıra geçmek için '\\n' karakterlerini metin içine yaz): \\nÜrün Özeti: ... \\nBesin Değerleri: ... \\nNutri-Score ve Nova: ... \\nİçerik ve Katkı Maddeleri: ... \\nSonuç: ...""
}
LÜTFEN DİKKAT: JSON formatının bozulmaması için string değerlerin içine ASLA gerçek satır atlama (enter) koyma, her zaman '\\n' kullan. Ürünün içinde olabilecek süt, fındık, gluten, soya, yer fıstığı gibi alerjenleri tahmin edip 'allergensHierarchy' içine string dizisi olarak ekle. Değerleri (kalori, yağ vs.) 100 gram üzerinden tahmin et. Sayısal besin değerlerini string formatında gönder. novaGroup 1 ile 4 arası tam sayı, nutritionGrades 'a', 'b', 'c', 'd', 'e' harflerinden biri olmalıdır. Score 0 ile 100 arasında sağlık puanıdır.";

                var aiResponse = await _geminiService.AnalyzeImageAsync(systemPrompt, base64Image);
                
                var jsonStr = aiResponse.Replace("```json", "").Replace("```", "").Trim();
                var dto = Newtonsoft.Json.JsonConvert.DeserializeObject<ProductAnalysisDto>(jsonStr);

                if (dto == null)
                {
                    throw new Exception("Yapay zeka geçerli bir format döndüremedi.");
                }

                // Generate AI barcode and assign
                string generatedCode = "AI_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                dto.Code = generatedCode;

                // Save product to database so it can be retrieved by daily summary later
                var newProduct = new Domain.Entities.Product
                {
                    Code = generatedCode,
                    ProductName = dto.ProductName,
                    ImageFrontUrl = dto.ImageFrontUrl,
                    NovaGroup = dto.NovaGroup,
                    NutritionGrades = dto.NutritionGrades,
                    AdditivesTags = dto.AdditivesTags,
                    AllergensHierarchy = dto.AllergensHierarchy,
                    Fat = dto.Fat,
                    Salt = dto.Salt,
                    SaturatedFat = dto.SaturatedFat,
                    Sugars = dto.Sugars,
                    EnergyKcal100g = float.TryParse(dto.EnergyKcal, out var k) ? k : 0,
                    Proteins100g = float.TryParse(dto.Proteins, out var p) ? p : 0,
                    Carbohydrates100g = float.TryParse(dto.Carbohydrates, out var c) ? c : 0,
                    Fat100g = float.TryParse(dto.Fat, out var f) ? f : 0,
                    Salt100g = float.TryParse(dto.Salt, out var s) ? s : 0,
                    SaturatedFat100g = float.TryParse(dto.SaturatedFat, out var sf) ? sf : 0,
                    Sugars100g = float.TryParse(dto.Sugars, out var su) ? su : 0
                };
                
                await _productRepository.AddAsync(newProduct);
                await _productRepository.SaveChangesAsync();

                bool isDeviceIdValid = !string.IsNullOrEmpty(deviceId) && deviceId.ToLower() != "null";
                if (isDeviceIdValid && dto.AllergensHierarchy != null && dto.AllergensHierarchy.Length > 0)
                {
                    try {
                        var userAllergens = await _allergenService.GetUserAllergensAsync(deviceId!);
                        var detected = AllergenDictionary.FindMatchingAllergens(
                            dto.AllergensHierarchy, "", userAllergens);
                        
                        dto.AllergenWarning = new AllergenWarningDto {
                            HasAllergenWarning = detected.Count > 0,
                            DetectedAllergens = detected
                        };
                    } catch { /* Alerjen hatası analizi durdurmasın */ }
                }

                return dto;
            }
            catch (Exception ex)
            {
                return new ProductAnalysisDto {
                    ProductName = "HATA OLUŞTU",
                    AiAnalysis = "Görsel Analiz Hatası: " + ex.Message
                };
            }
        }
    }
}
