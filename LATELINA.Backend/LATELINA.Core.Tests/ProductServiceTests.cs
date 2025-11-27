using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Latelina.Core.DTOs;
using Latelina.Core.Mapping;
using Latelina.Core.Services;
using Latelina.Domain.Entities;
using Latelina.Infrastructure.Data;
using Latelina.Infrastructure.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;

namespace Latelina.Core.Tests;

public class ProductServiceTests
{
    [Fact]
    public async Task GetProductsAsync_AppliesFiltersAndPaging()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var interceptor = new CommandCaptureInterceptor();
        var options = new DbContextOptionsBuilder<LatelinaDbContext>()
            .UseSqlite(connection)
            .AddInterceptors(interceptor)
            .Options;

        await using var context = new LatelinaDbContext(options);
        await context.Database.EnsureCreatedAsync();

        var seedData = await SeedTestDataAsync(context);
        context.ChangeTracker.Clear();
        interceptor.CommandTexts.Clear();

        var service = new ProductService(
            new Repository<Product>(context),
            new Repository<Category>(context),
            CreateMapper());

        var filter = new ProductFilterDto
        {
            CategoryId = seedData.GiftsCategoryId,
            MinPrice = 10,
            MaxPrice = 30,
            SearchTerm = "gift",
            PageNumber = 2,
            PageSize = 3
        };

        var result = await service.GetProductsAsync(filter);

        Assert.Equal(filter.PageSize, result.Items.Count);
        Assert.Equal(seedData.MatchingProductIds.Count, result.TotalCount);
        Assert.Equal(filter.PageNumber, result.PageNumber);
        Assert.Equal(filter.PageSize, result.PageSize);

        Assert.All(result.Items, item =>
        {
            Assert.Equal(seedData.GiftsCategoryId, item.CategoryId);
            Assert.InRange(item.Price, filter.MinPrice!.Value, filter.MaxPrice!.Value);
            Assert.Contains("gift", item.Name, StringComparison.OrdinalIgnoreCase);
            Assert.False(string.IsNullOrWhiteSpace(item.CategoryName));
        });

        var firstPageIds = seedData.MatchingProductIds
            .Take(filter.PageSize)
            .ToHashSet();

        Assert.All(result.Items, item => Assert.DoesNotContain(item.Id, firstPageIds));
    }

    [Fact]
    public async Task GetProductsAsync_UsesPagedDatabaseQueries()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var interceptor = new CommandCaptureInterceptor();
        var options = new DbContextOptionsBuilder<LatelinaDbContext>()
            .UseSqlite(connection)
            .AddInterceptors(interceptor)
            .Options;

        await using var context = new LatelinaDbContext(options);
        await context.Database.EnsureCreatedAsync();

        var seedData = await SeedTestDataAsync(context);
        context.ChangeTracker.Clear();
        interceptor.CommandTexts.Clear();

        var service = new ProductService(
            new Repository<Product>(context),
            new Repository<Category>(context),
            CreateMapper());

        var filter = new ProductFilterDto
        {
            CategoryId = seedData.GiftsCategoryId,
            PageNumber = 1,
            PageSize = 5
        };

        var result = await service.GetProductsAsync(filter);

        Assert.Equal(filter.PageSize, result.Items.Count);

        var productCommands = interceptor.CommandTexts
            .Where(cmd => cmd.Contains("\"Products\"", StringComparison.OrdinalIgnoreCase))
            .ToList();

        Assert.Contains(productCommands, cmd => cmd.Contains("COUNT", StringComparison.OrdinalIgnoreCase));

        Assert.Contains(
            productCommands,
            cmd => cmd.Contains("LIMIT", StringComparison.OrdinalIgnoreCase)
                   && cmd.Contains("OFFSET", StringComparison.OrdinalIgnoreCase));

        Assert.Empty(context.ChangeTracker.Entries<Product>());
    }

    private static async Task<SeedData> SeedTestDataAsync(LatelinaDbContext context)
    {
        var gifts = new Category { Name = "Gifts", Icon = "gift" };
        var toys = new Category { Name = "Toys", Icon = "gamepad" };

        await context.Categories.AddRangeAsync(gifts, toys);
        await context.SaveChangesAsync();

        var products = new List<Product>();

        for (var i = 1; i <= 40; i++)
        {
            products.Add(new Product
            {
                Name = $"Gift Basket {i}",
                Description = "Curated gift basket",
                Price = 5 + i,
                StockQuantity = 50 + i,
                CategoryId = gifts.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        for (var i = 1; i <= 10; i++)
        {
            products.Add(new Product
            {
                Name = $"Toy Set {i}",
                Description = "Fun playtime set",
                Price = 15 + i,
                StockQuantity = 30 + i,
                CategoryId = toys.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();

        var matchingProductIds = products
            .Where(p => p.CategoryId == gifts.Id
                        && p.Price >= 10
                        && p.Price <= 30
                        && p.Name.Contains("gift", StringComparison.OrdinalIgnoreCase))
            .Select(p => p.Id)
            .OrderBy(id => id)
            .ToList();

        return new SeedData(gifts.Id, matchingProductIds);
    }

    private static IMapper CreateMapper()
    {
        var configuration = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        return configuration.CreateMapper();
    }

    private sealed record SeedData(int GiftsCategoryId, List<int> MatchingProductIds);

    private sealed class CommandCaptureInterceptor : DbCommandInterceptor
    {
        public List<string> CommandTexts { get; } = new();

        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            CommandTexts.Add(command.CommandText);
            return base.ReaderExecuting(command, eventData, result);
        }

        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            CommandTexts.Add(command.CommandText);
            return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
        }

        public override InterceptionResult<object> ScalarExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<object> result)
        {
            CommandTexts.Add(command.CommandText);
            return base.ScalarExecuting(command, eventData, result);
        }

        public override ValueTask<InterceptionResult<object>> ScalarExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<object> result,
            CancellationToken cancellationToken = default)
        {
            CommandTexts.Add(command.CommandText);
            return base.ScalarExecutingAsync(command, eventData, result, cancellationToken);
        }
    }
}
