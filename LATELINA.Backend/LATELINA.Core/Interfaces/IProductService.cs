using AIPharm.Core.DTOs;

namespace AIPharm.Core.Interfaces
{
    public interface IProductService
    {
        Task<PagedResultDto<ProductDto>> GetProductsAsync(ProductFilterDto filter);
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm);
        Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto);
        Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateProductDto);
        Task DeleteProductAsync(int id);
    }
}