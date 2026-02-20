using Application.DTOs;
using Application.DTOs.ExternalDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Abstracts.Services
{
    public interface IFoodAnalysisService
    {
        Task<ProductAnalysisDto> AnalyzeProduct(string barcode, string? deviceId = null);
    }
}
