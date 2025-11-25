using System.Net;
using System.Net.Http.Json;
using AIPharm.Core.DTOs;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace AIPharm.Web.Tests;

public class ProductsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ProductsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateProduct_InvalidPayload_ReturnsBadRequest()
    {
        var payload = new
        {
            Name = string.Empty,
            Price = 0m,
            StockQuantity = -5,
            CategoryId = 0,
            RequiresPrescription = false
        };

        var response = await _client.PostAsJsonAsync("/api/Products", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();

        Assert.NotNull(problem);
        Assert.True(problem!.Errors.ContainsKey(nameof(CreateProductDto.Name)));
        Assert.Contains("Name is required", problem.Errors[nameof(CreateProductDto.Name)][0]);
        Assert.True(problem.Errors.ContainsKey(nameof(CreateProductDto.Price)));
        Assert.Contains("Price must be between", problem.Errors[nameof(CreateProductDto.Price)][0]);
        Assert.True(problem.Errors.ContainsKey(nameof(CreateProductDto.StockQuantity)));
        Assert.Contains("Stock quantity must be between", problem.Errors[nameof(CreateProductDto.StockQuantity)][0]);
        Assert.True(problem.Errors.ContainsKey(nameof(CreateProductDto.CategoryId)));
        Assert.Contains("positive integer", problem.Errors[nameof(CreateProductDto.CategoryId)][0]);
    }

    [Fact]
    public async Task CreateProduct_ValidPayload_ReturnsCreatedProduct()
    {
        var payload = new
        {
            Name = "Integration Test Product",
            Price = 12.50m,
            StockQuantity = 10,
            CategoryId = 1,
            RequiresPrescription = false
        };

        var response = await _client.PostAsJsonAsync("/api/Products", payload);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var product = await response.Content.ReadFromJsonAsync<ProductDto>();
        Assert.NotNull(product);
        Assert.Equal(payload.Name, product!.Name);
        Assert.Equal(payload.Price, product.Price);
        Assert.Equal(payload.StockQuantity, product.StockQuantity);
        Assert.Equal(payload.CategoryId, product.CategoryId);
    }
}
