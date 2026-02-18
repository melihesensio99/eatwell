using Domain.Entities;

namespace Application.Abstracts.Services
{
    public interface IProductService
    {
        Task<Product> GetAndifExistSaveProductAsync(string barcode);
    }
}
