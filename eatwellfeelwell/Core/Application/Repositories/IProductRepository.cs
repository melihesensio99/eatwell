using Domain.Entities;

namespace Application.Repositories
{
    public interface IProductRepository
    {
        Task<Product?> GetProductByBarcodeAsync(string barcode);
        Task<List<Product>> GetProductsByBarcodesAsync(List<string> barcodes);
        Task AddAsync(Product product);
        Task SaveChangesAsync();
        void Detach(Product product);
    }
}
