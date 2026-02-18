using Application.Abstracts.Services;
using Application.Abstracts.Services.ExternalServices;
using Application.DTOs;
using Application.DTOs.ExternalDtos;
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
    public class FoodAnalysisService : IIFoodAnalysisService
    {
        private readonly IProductService _productService;
        private readonly IMapper _mapper;

        public FoodAnalysisService(IProductService productService, IMapper mapper)
        {
            _productService = productService;
            _mapper = mapper;
        }

        public async Task<ProductAnalysisDto> AnalyzeProduct(string barcode)
        {
            var result = await _productService.GetAndifExistSaveProductAsync(barcode);

            var dto = _mapper.Map<ProductAnalysisDto>(result);

            dto.AdditiveDescriptions = AdditivesDictionary.GetDescriptions(result.AdditivesTags);
            int score = HealthScoreCalculator.Calculate(result);
            dto.IsHealthy = score >= 70;

            var warnings = new List<string>();
            if (result.Fat?.ToLower() == "high") warnings.Add("Yağ oranı yüksek");
            if (result.Salt?.ToLower() == "high") warnings.Add("Tuz oranı yüksek");
            if (result.SaturatedFat?.ToLower() == "high") warnings.Add("Doymuş yağ yüksek");
            if (result.Sugars?.ToLower() == "high") warnings.Add("Şeker oranı yüksek");

            dto.Score = score;
            return dto;
        }
    }
}
