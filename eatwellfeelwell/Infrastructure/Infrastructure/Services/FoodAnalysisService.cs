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

        public FoodAnalysisService(
            IProductService productService, 
            IUserAllergenService allergenService, 
            IGeminiService geminiService,
            ICalorieGoalService calorieGoalService,
            IMapper mapper,
            IConfiguration configuration)
        {
            _productService = productService;
            _allergenService = allergenService;
            _geminiService = geminiService;
            _calorieGoalService = calorieGoalService;
            _mapper = mapper;
            _configuration = configuration;
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
    }
}
