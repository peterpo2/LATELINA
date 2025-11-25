using AutoMapper;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;

namespace AIPharm.Core.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IRepository<Category> _categoryRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IMapper _mapper;

        public CategoryService(
            IRepository<Category> categoryRepository,
            IRepository<Product> productRepository,
            IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _productRepository = productRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            var categoryDtos = _mapper.Map<IEnumerable<CategoryDto>>(categories);

            // Add product counts
            foreach (var categoryDto in categoryDtos)
            {
                categoryDto.ProductCount = await _productRepository.CountAsync(p => p.CategoryId == categoryDto.Id);
            }

            return categoryDtos;
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return null;

            var categoryDto = _mapper.Map<CategoryDto>(category);
            categoryDto.ProductCount = await _productRepository.CountAsync(p => p.CategoryId == id);

            return categoryDto;
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto)
        {
            var category = _mapper.Map<Category>(createCategoryDto);
            category.CreatedAt = DateTime.UtcNow;
            category.UpdatedAt = DateTime.UtcNow;

            var createdCategory = await _categoryRepository.AddAsync(category);
            var categoryDto = _mapper.Map<CategoryDto>(createdCategory);
            categoryDto.ProductCount = 0;

            return categoryDto;
        }

        public async Task<CategoryDto> UpdateCategoryAsync(int id, UpdateCategoryDto updateCategoryDto)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                throw new ArgumentException($"Category with ID {id} not found");

            _mapper.Map(updateCategoryDto, category);
            category.UpdatedAt = DateTime.UtcNow;

            var updatedCategory = await _categoryRepository.UpdateAsync(category);
            var categoryDto = _mapper.Map<CategoryDto>(updatedCategory);
            categoryDto.ProductCount = await _productRepository.CountAsync(p => p.CategoryId == id);

            return categoryDto;
        }

        public async Task DeleteCategoryAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                throw new ArgumentException($"Category with ID {id} not found");

            // Check if category has products
            var hasProducts = await _productRepository.ExistsAsync(p => p.CategoryId == id);
            if (hasProducts)
                throw new InvalidOperationException("Cannot delete category that contains products");

            category.IsDeleted = true;
            category.UpdatedAt = DateTime.UtcNow;
            await _categoryRepository.UpdateAsync(category);
        }
    }
}