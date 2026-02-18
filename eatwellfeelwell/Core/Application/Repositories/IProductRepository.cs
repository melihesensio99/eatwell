using Domain.Entities;

namespace Application.Repositories
{
    public interface IProductRepository
    {
        Task<Product?> GetProductByBarcodeAsync(string barcode);
        Task AddAsync(Product product);
        Task SaveChangesAsync();
    }
}
