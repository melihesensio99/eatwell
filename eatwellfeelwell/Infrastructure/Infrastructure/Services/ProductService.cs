using Application.Abstracts.Services;
using Application.Abstracts.Services.ExternalServices;
using Application.Repositories;
using AutoMapper;
using Domain.Entities;

namespace Infrastructure.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repository;
        private readonly IMapper _mapper;
        private readonly IFoodApiClient _foodApiClient;

        public ProductService(IProductRepository repository, IMapper mapper, IFoodApiClient foodApiClient)
        {
            _repository = repository;
            _mapper = mapper;
            _foodApiClient = foodApiClient;
        }

        public async Task<Product> GetAndifExistSaveProductAsync(string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
                throw new ArgumentException("Barkod değeri boş olamaz");

            barcode = barcode.Trim();

          
            var existing = await _repository.GetProductByBarcodeAsync(barcode);
            if (existing != null)
                return existing;

            var apiResponse = await _foodApiClient.GetProductByBarcode(barcode);
            var product = _mapper.Map<Product>(apiResponse);

            if (string.IsNullOrEmpty(product.Code))
                product.Code = barcode;

            var doubleCheck = await _repository.GetProductByBarcodeAsync(barcode);
            if (doubleCheck != null)
                return doubleCheck;

            await _repository.AddAsync(product);
            await _repository.SaveChangesAsync();

            return product;
        }
    }
}

