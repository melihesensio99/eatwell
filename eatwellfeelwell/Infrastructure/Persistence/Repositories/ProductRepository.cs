using Application.Repositories;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Persistence.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly EatWellContext _context;

        public ProductRepository(EatWellContext context)
        {
            _context = context;
        }

        public async Task<Product?> GetProductByBarcodeAsync(string barcode)
        {

            return await _context.Products
                .FirstOrDefaultAsync(p => p.Code == barcode);
        }

        public async Task AddAsync(Product product)
        {

            await _context.Products.AddAsync(product);
        }

        public async Task SaveChangesAsync()
        {

            await _context.SaveChangesAsync();
        }

       
    }
}
