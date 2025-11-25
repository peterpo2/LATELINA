using AutoMapper;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using AIPharm.Core.Mapping;
using AIPharm.Core.Services;
using AIPharm.Domain.Entities;
using Moq;
using Xunit;

namespace AIPharm.Core.Tests.Services;

public class ProductServiceTests
{
    private readonly Mock<IRepository<Product>> _productRepositoryMock;
    private readonly Mock<IRepository<Category>> _categoryRepositoryMock;
    private readonly IMapper _mapper;
    private readonly ProductService _productService;

    public ProductServiceTests()
    {
        _productRepositoryMock = new Mock<IRepository<Product>>();
        _categoryRepositoryMock = new Mock<IRepository<Category>>();
        var mapperConfiguration = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = mapperConfiguration.CreateMapper();
        _productService = new ProductService(
            _productRepositoryMock.Object,
            _categoryRepositoryMock.Object,
            _mapper);
    }

    [Fact]
    public async Task CreateProductAsync_WithValidCategory_ReturnsProductDto()
    {
        var createDto = new CreateProductDto
        {
            Name = "Painkiller",
            Description = "Fast acting relief",
            Price = 19.99m,
            StockQuantity = 10,
            CategoryId = 1,
            RequiresPrescription = false
        };

        var category = new Category { Id = 1, Name = "Analgesics", Icon = "pill" };

        _categoryRepositoryMock
            .Setup(repo => repo.GetByIdAsync(createDto.CategoryId))
            .ReturnsAsync(category);

        _productRepositoryMock
            .Setup(repo => repo.AddAsync(It.IsAny<Product>()))
            .ReturnsAsync((Product product) =>
            {
                product.Id = 42;
                return product;
            });

        var result = await _productService.CreateProductAsync(createDto);

        Assert.Equal(42, result.Id);
        Assert.Equal(createDto.Name, result.Name);
        Assert.Equal(createDto.CategoryId, result.CategoryId);
        _categoryRepositoryMock.Verify(repo => repo.GetByIdAsync(createDto.CategoryId), Times.Once);
        _productRepositoryMock.Verify(repo => repo.AddAsync(It.Is<Product>(p => p.CategoryId == createDto.CategoryId)), Times.Once);
    }

    [Fact]
    public async Task CreateProductAsync_WithInvalidCategory_ThrowsArgumentException()
    {
        var createDto = new CreateProductDto
        {
            Name = "Painkiller",
            Price = 19.99m,
            StockQuantity = 10,
            CategoryId = 99
        };

        _categoryRepositoryMock
            .Setup(repo => repo.GetByIdAsync(createDto.CategoryId))
            .ReturnsAsync((Category?)null);

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _productService.CreateProductAsync(createDto));

        Assert.Contains($"Category with ID {createDto.CategoryId}", exception.Message);
        _productRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<Product>()), Times.Never);
    }

    [Fact]
    public async Task UpdateProductAsync_WithValidCategory_ReturnsUpdatedProductDto()
    {
        var existingProduct = new Product
        {
            Id = 5,
            Name = "Painkiller",
            CategoryId = 1,
            Price = 9.99m,
            StockQuantity = 5,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };

        var updateDto = new UpdateProductDto
        {
            Name = "Painkiller Plus",
            CategoryId = 2,
            Price = 14.99m
        };

        var category = new Category { Id = 2, Name = "Supplements", Icon = "leaf" };

        _productRepositoryMock
            .Setup(repo => repo.GetByIdAsync(existingProduct.Id))
            .ReturnsAsync(existingProduct);

        _categoryRepositoryMock
            .Setup(repo => repo.GetByIdAsync(updateDto.CategoryId!.Value))
            .ReturnsAsync(category);

        _productRepositoryMock
            .Setup(repo => repo.UpdateAsync(existingProduct))
            .ReturnsAsync(existingProduct);

        var result = await _productService.UpdateProductAsync(existingProduct.Id, updateDto);

        Assert.Equal(existingProduct.Id, result.Id);
        Assert.Equal(updateDto.Name, result.Name);
        Assert.Equal(updateDto.CategoryId, result.CategoryId);
        _categoryRepositoryMock.Verify(repo => repo.GetByIdAsync(updateDto.CategoryId.Value), Times.Once);
        _productRepositoryMock.Verify(repo => repo.UpdateAsync(existingProduct), Times.Once);
    }

    [Fact]
    public async Task UpdateProductAsync_WithInvalidCategory_ThrowsArgumentException()
    {
        var existingProduct = new Product
        {
            Id = 5,
            Name = "Painkiller",
            CategoryId = 1
        };

        var updateDto = new UpdateProductDto
        {
            CategoryId = 99
        };

        _productRepositoryMock
            .Setup(repo => repo.GetByIdAsync(existingProduct.Id))
            .ReturnsAsync(existingProduct);

        _categoryRepositoryMock
            .Setup(repo => repo.GetByIdAsync(updateDto.CategoryId!.Value))
            .ReturnsAsync((Category?)null);

        await Assert.ThrowsAsync<ArgumentException>(() => _productService.UpdateProductAsync(existingProduct.Id, updateDto));

        _productRepositoryMock.Verify(repo => repo.UpdateAsync(It.IsAny<Product>()), Times.Never);
    }

    [Fact]
    public async Task UpdateProductAsync_ProductNotFound_ThrowsKeyNotFoundException()
    {
        var updateDto = new UpdateProductDto { Name = "Painkiller" };

        _productRepositoryMock
            .Setup(repo => repo.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((Product?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _productService.UpdateProductAsync(123, updateDto));

        _categoryRepositoryMock.Verify(repo => repo.GetByIdAsync(It.IsAny<int>()), Times.Never);
    }
}
