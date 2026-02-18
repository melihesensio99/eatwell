using Application.Abstracts.Services;
using Application.Abstracts.Services.ExternalServices;
using Application.Repositories;
using AutoMapper;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
           var data = await _repository.GetProductByBarcodeAsync(barcode);
            if(data != null)
                return data;
            var apiResponse = await _foodApiClient.GetProductByBarcode(barcode);
              
           var result = _mapper.Map<Product>(apiResponse);

            await _repository.AddAsync(result);
            await _repository.SaveChangesAsync();
            return result;

        }
    }
}
