using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using AIPharm.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace AIPharm.Core.Tests.Controllers;

public class ProductsControllerTests
{
    private readonly Mock<IProductService> _productServiceMock;
    private readonly ProductsController _controller;

    public ProductsControllerTests()
    {
        _productServiceMock = new Mock<IProductService>();
        _controller = new ProductsController(_productServiceMock.Object);
    }

    [Fact]
    public async Task CreateProduct_WhenCategoryIsInvalid_ReturnsBadRequest()
    {
        var dto = new CreateProductDto { CategoryId = 99 };

        _productServiceMock
            .Setup(service => service.CreateProductAsync(It.IsAny<CreateProductDto>()))
            .ThrowsAsync(new ArgumentException("Category not found"));

        var result = await _controller.CreateProduct(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Category", badRequest.Value?.ToString());
    }

    [Fact]
    public async Task CreateProduct_WhenSuccessful_ReturnsCreatedAtAction()
    {
        var dto = new CreateProductDto { Name = "Painkiller", CategoryId = 1 };
        var product = new ProductDto { Id = 10, Name = dto.Name, CategoryId = dto.CategoryId };

        _productServiceMock
            .Setup(service => service.CreateProductAsync(It.IsAny<CreateProductDto>()))
            .ReturnsAsync(product);

        var result = await _controller.CreateProduct(dto);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(product, createdResult.Value);
    }

    [Fact]
    public async Task UpdateProduct_WhenCategoryIsInvalid_ReturnsBadRequest()
    {
        var dto = new UpdateProductDto { CategoryId = 5 };

        _productServiceMock
            .Setup(service => service.UpdateProductAsync(It.IsAny<int>(), It.IsAny<UpdateProductDto>()))
            .ThrowsAsync(new ArgumentException("Category not found"));

        var result = await _controller.UpdateProduct(1, dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Category", badRequest.Value?.ToString());
    }

    [Fact]
    public async Task UpdateProduct_WhenProductIsMissing_ReturnsNotFound()
    {
        _productServiceMock
            .Setup(service => service.UpdateProductAsync(It.IsAny<int>(), It.IsAny<UpdateProductDto>()))
            .ThrowsAsync(new KeyNotFoundException("Product not found"));

        var result = await _controller.UpdateProduct(1, new UpdateProductDto());

        var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
        Assert.Contains("Product", notFound.Value?.ToString());
    }

    [Fact]
    public async Task DeleteProduct_WhenProductIsMissing_ReturnsNotFound()
    {
        _productServiceMock
            .Setup(service => service.DeleteProductAsync(It.IsAny<int>()))
            .ThrowsAsync(new KeyNotFoundException("Product not found"));

        var result = await _controller.DeleteProduct(1);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains("Product", notFound.Value?.ToString());
    }
}
