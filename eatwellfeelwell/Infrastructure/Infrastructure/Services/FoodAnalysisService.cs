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
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class FoodAnalysisService : IFoodAnalysisService
    {
        private readonly IProductService _productService;
        private readonly IUserAllergenService _allergenService;
        private readonly IMapper _mapper;

        public FoodAnalysisService(IProductService productService, IUserAllergenService allergenService, IMapper mapper)
        {
            _productService = productService;
            _allergenService = allergenService;
            _mapper = mapper;
        }

        public async Task<ProductAnalysisDto> AnalyzeProduct(string barcode, string? deviceId = null)
        {
            if (string.IsNullOrWhiteSpace(barcode))
                throw new ValidationException("Barkod değeri boş olamaz");

            var result = await _productService.GetAndifExistSaveProductAsync(barcode);
            if (result == null)
                throw new NotFoundException("Ürün", barcode);

            var dto = _mapper.Map<ProductAnalysisDto>(result);

            dto.AdditiveDescriptions = AdditivesDictionary.GetDescriptions(result.AdditivesTags);
            int score = HealthScoreCalculator.Calculate(result);
            dto.IsHealthy = score >= 70;


            dto.Score = score;

            if (!string.IsNullOrEmpty(deviceId))
            {
                var userAllergens = await _allergenService.GetUserAllergensAsync(deviceId);
                if (userAllergens.Count > 0)
                {
                    var detected = AllergenDictionary.FindMatchingAllergens(
                        result.AllergensHierarchy, result.AllergensFromIngredients, userAllergens);

                    dto.AllergenWarning = new AllergenWarningDto
                    {
                        HasAllergenWarning = detected.Count > 0,
                        DetectedAllergens = detected
                    };
                }
            }

            return dto;
        }
    }
}
