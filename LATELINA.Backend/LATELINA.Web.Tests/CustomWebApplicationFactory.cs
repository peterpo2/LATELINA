using System.Linq;
using AIPharm.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AIPharm.Web.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            var descriptors = services
                .Where(d => d.ServiceType == typeof(DbContextOptions<AIPharmDbContext>)
                         || d.ServiceType == typeof(AIPharmDbContext)
                         || d.ServiceType == typeof(IDbContextFactory<AIPharmDbContext>)
                         || d.ServiceType == typeof(IPooledDbContextFactory<AIPharmDbContext>))
                .ToList();

            foreach (var descriptor in descriptors)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AIPharmDbContext>(options =>
                options.UseInMemoryDatabase("AIPharmTests"));

            var serviceProvider = services.BuildServiceProvider();

            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AIPharmDbContext>();
            db.Database.EnsureCreated();
        });
    }
}
