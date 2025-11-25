using AutoMapper;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AIPharm.Core.Services
{
    public class ProductService : IProductService
    {
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<Category> _categoryRepository;
        private readonly IMapper _mapper;

        public ProductService(
            IRepository<Product> productRepository,
            IRepository<Category> categoryRepository,
            IMapper mapper)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task<PagedResultDto<ProductDto>> GetProductsAsync(ProductFilterDto filter)
        {
            var products = _productRepository.Query();

            // Apply filters
            if (filter.CategoryId.HasValue)
            {
                products = products.Where(p => p.CategoryId == filter.CategoryId.Value);
            }

            if (filter.MinPrice.HasValue)
            {
                products = products.Where(p => p.Price >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                products = products.Where(p => p.Price <= filter.MaxPrice.Value);
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                products = products.Where(p =>
                    p.Name.ToLower().Contains(searchTerm) ||
                    (p.Description != null && p.Description.ToLower().Contains(searchTerm)) ||
                    (p.ActiveIngredient != null && p.ActiveIngredient.ToLower().Contains(searchTerm)));
            }

            if (filter.RequiresPrescription.HasValue)
            {
                products = products.Where(p => p.RequiresPrescription == filter.RequiresPrescription.Value);
            }

            var totalCount = await products.CountAsync();
            var skip = (filter.PageNumber - 1) * filter.PageSize;
            if (skip < 0)
            {
                skip = 0;
            }

            var pagedProducts = await products
                .Skip(skip)
                .Take(filter.PageSize)
                .ToListAsync();

            var productDtos = _mapper.Map<List<ProductDto>>(pagedProducts);

            // Add category names
            var categoryIds = productDtos.Select(p => p.CategoryId).Distinct();
            var categories = await _categoryRepository.FindAsync(c => categoryIds.Contains(c.Id));
            var categoryDict = categories.ToDictionary(c => c.Id, c => c.Name);

            foreach (var product in productDtos)
            {
                product.CategoryName = categoryDict.GetValueOrDefault(product.CategoryId);
            }

            return new PagedResultDto<ProductDto>
            {
                Items = productDtos,
                TotalCount = totalCount,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            };
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return null;

            var productDto = _mapper.Map<ProductDto>(product);
            
            var category = await _categoryRepository.GetByIdAsync(product.CategoryId);
            productDto.CategoryName = category?.Name;

            return productDto;
        }

        public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm)
        {
            var products = await _productRepository.FindAsync(p =>
                p.Name.Contains(searchTerm) ||
                (p.Description != null && p.Description.Contains(searchTerm)) ||
                (p.ActiveIngredient != null && p.ActiveIngredient.Contains(searchTerm)));

            return _mapper.Map<IEnumerable<ProductDto>>(products);
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto)
        {
            var category = await _categoryRepository.GetByIdAsync(createProductDto.CategoryId);
            if (category == null)
            {
                throw new ArgumentException($"Category with ID {createProductDto.CategoryId} not found");
            }

            var product = _mapper.Map<Product>(createProductDto);
            product.CreatedAt = DateTime.UtcNow;
            product.UpdatedAt = DateTime.UtcNow;

            var createdProduct = await _productRepository.AddAsync(product);
            return _mapper.Map<ProductDto>(createdProduct);
        }

        public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateProductDto)
        {
            ArgumentNullException.ThrowIfNull(updateProductDto);

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                throw new KeyNotFoundException($"Product with ID {id} not found");

            if (updateProductDto.CategoryId.HasValue)
            {
                var category = await _categoryRepository.GetByIdAsync(updateProductDto.CategoryId.Value);
                if (category == null)
                {
                    throw new ArgumentException($"Category with ID {updateProductDto.CategoryId.Value} not found");
                }
            }

            _mapper.Map(updateProductDto, product);
            product.UpdatedAt = DateTime.UtcNow;

            var updatedProduct = await _productRepository.UpdateAsync(product);
            return _mapper.Map<ProductDto>(updatedProduct);
        }

        public async Task DeleteProductAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                throw new KeyNotFoundException($"Product with ID {id} not found");

            product.IsDeleted = true;
            product.UpdatedAt = DateTime.UtcNow;
            await _productRepository.UpdateAsync(product);
        }

        private static void ValidateCreateProductInput(CreateProductDto createProductDto)
        {
            if (string.IsNullOrWhiteSpace(createProductDto.Name))
            {
                throw new ArgumentException("Product name is required.", nameof(CreateProductDto.Name));
            }

            if (createProductDto.Price <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(CreateProductDto.Price), "Price must be greater than zero.");
            }

            if (createProductDto.StockQuantity < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(CreateProductDto.StockQuantity), "Stock quantity cannot be negative.");
            }

            if (createProductDto.CategoryId <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(CreateProductDto.CategoryId), "CategoryId must be greater than zero.");
            }
        }

        private static void ValidateUpdateProductInput(UpdateProductDto updateProductDto)
        {
            if (updateProductDto.Name != null && string.IsNullOrWhiteSpace(updateProductDto.Name))
            {
                throw new ArgumentException("Product name cannot be empty when provided.", nameof(UpdateProductDto.Name));
            }

            if (updateProductDto.Price.HasValue && updateProductDto.Price.Value <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(UpdateProductDto.Price), "Price must be greater than zero.");
            }

            if (updateProductDto.StockQuantity.HasValue && updateProductDto.StockQuantity.Value < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(UpdateProductDto.StockQuantity), "Stock quantity cannot be negative.");
            }

            if (updateProductDto.CategoryId.HasValue && updateProductDto.CategoryId.Value <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(UpdateProductDto.CategoryId), "CategoryId must be greater than zero.");
            }
        }
    }
}