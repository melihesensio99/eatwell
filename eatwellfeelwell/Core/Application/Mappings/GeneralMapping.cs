using Application.DTOs;
using Application.DTOs.ExternalDtos;
using AutoMapper;
using Domain.Entities;

namespace Application.Mappings
{
    public class GeneralMapping : Profile
    {
        public GeneralMapping()
        {


            CreateMap<OpenFoodResponseDto, Product>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product!.ProductName))
                .ForMember(dest => dest.ImageFrontUrl, opt => opt.MapFrom(src => src.Product!.ImageFrontUrl))
                .ForMember(dest => dest.AdditivesN, opt => opt.MapFrom(src => src.Product!.AdditivesN))
                .ForMember(dest => dest.AdditivesTags, opt => opt.MapFrom(src => src.Product!.AdditivesTags))
                .ForMember(dest => dest.AllergensFromIngredients, opt => opt.MapFrom(src => src.Product!.AllergensFromIngredients))
                .ForMember(dest => dest.AllergensHierarchy, opt => opt.MapFrom(src => src.Product!.AllergensHierarchy))
                .ForMember(dest => dest.NovaGroup, opt => opt.MapFrom(src => src.Product!.NovaGroup))
                .ForMember(dest => dest.QualityTags, opt => opt.MapFrom(src => src.Product!.QualityTags))
                .ForMember(dest => dest.NutritionGrades, opt => opt.MapFrom(src => src.Product!.NutritionGrades))
                .ForMember(dest => dest.NutritionScoreBeverage, opt => opt.MapFrom(src => src.Product!.NutritionScoreBeverage))

                .ForMember(dest => dest.Salt100g, opt => opt.MapFrom(src => src.Product!.Nutriments.Salt100g))
                .ForMember(dest => dest.Fat100g, opt => opt.MapFrom(src => src.Product!.Nutriments.Fat100g))
                .ForMember(dest => dest.SaturatedFat100g, opt => opt.MapFrom(src => src.Product!.Nutriments.SaturatedFat100g))
                .ForMember(dest => dest.Sugars100g, opt => opt.MapFrom(src => src.Product!.Nutriments.Sugars100g))
                .ForMember(dest => dest.Carbohydrates100g, opt => opt.MapFrom(src => src.Product!.Nutriments.Carbohydrates100g))
                .ForMember(dest => dest.EnergyKcal100g, opt => opt.MapFrom(src => src.Product!.Nutriments.EnergyKcal100g))
                .ForMember(dest => dest.Proteins100g, opt => opt.MapFrom(src => src.Product!.Nutriments.Proteins100g))

                .ForMember(dest => dest.Fat, opt => opt.MapFrom(src => src.Product!.NutrientLevels.Fat))
                .ForMember(dest => dest.Salt, opt => opt.MapFrom(src => src.Product!.NutrientLevels.Salt))
                .ForMember(dest => dest.SaturatedFat, opt => opt.MapFrom(src => src.Product!.NutrientLevels.SaturatedFat))
                .ForMember(dest => dest.Sugars, opt => opt.MapFrom(src => src.Product!.NutrientLevels.Sugars));


            CreateMap<Product, ProductAnalysisDto>()
                .ForMember(dest => dest.Score, opt => opt.Ignore())
                .ForMember(dest => dest.IsHealthy, opt => opt.Ignore())
                .ForMember(dest => dest.AdditiveDescriptions, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<Product, FoodCalorieInfoDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.ProductName))
                .ForMember(dest => dest.CaloriePercentInfo, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<AddConsumptionDto, DailyLog>();

        }
    }
}
