using System.Linq;
using Latelina.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Latelina.Web.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            var descriptors = services
                .Where(d => d.ServiceType == typeof(DbContextOptions<LatelinaDbContext>)
                         || d.ServiceType == typeof(LatelinaDbContext)
                         || d.ServiceType == typeof(IDbContextFactory<LatelinaDbContext>))
                .ToList();

            foreach (var descriptor in descriptors)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<LatelinaDbContext>(options =>
                options.UseInMemoryDatabase("LatelinaTests"));

            var serviceProvider = services.BuildServiceProvider();

            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<LatelinaDbContext>();
            db.Database.EnsureCreated();
        });
    }
}
