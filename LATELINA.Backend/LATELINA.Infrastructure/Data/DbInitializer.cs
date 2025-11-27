using System;
using System.Collections.Generic;
using System.Linq;
using Latelina.Core.Security;
using Latelina.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Latelina.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(LatelinaDbContext context, bool dropAndRecreate, CancellationToken ct = default)
        {
            if (dropAndRecreate)
            {
                await context.Database.EnsureDeletedAsync(ct);
            }

            await context.Database.MigrateAsync(ct);

            await EnsureAdminTwoFactorDisabledAsync(context, ct);

            var categorySeeds = new (string Name, string Description, string Icon)[]
            {
                ("Мечета от рози", "Ръчно изработени мечета от розови цветчета", "heart"),
                ("Подаръчни кошници", "Готови сетове с шоколад, вино и малки изненади", "gift"),
                ("Романтични комплекти", "Свещи, картички и малки аксесоари за двама", "sparkles"),
                ("Сладки изненади", "Луксозни шоколади и бисквити в празнични опаковки", "star"),
                ("Декорации", "Вечни рози, фоторамки и декоративни лампи", "moon"),
                ("Специални поводи", "Идеи за сватба, годеж или годишнина", "crown")
            };

            var categoryNameSet = new HashSet<string>(categorySeeds.Select(c => c.Name), StringComparer.OrdinalIgnoreCase);
            var existingCategories = await context.Categories.AsNoTracking().ToListAsync(ct);
            var existingCategoryNames = new HashSet<string>(existingCategories.Select(c => c.Name), StringComparer.OrdinalIgnoreCase);

            var newCategories = categorySeeds
                .Where(seed => !existingCategoryNames.Contains(seed.Name))
                .Select(seed => new Category
                {
                    Name = seed.Name,
                    Description = seed.Description,
                    Icon = seed.Icon
                })
                .ToList();

            if (newCategories.Count > 0)
            {
                await context.Categories.AddRangeAsync(newCategories, ct);
                await context.SaveChangesAsync(ct);
                existingCategories = await context.Categories.AsNoTracking().ToListAsync(ct);
            }

            var categoryDictionary = existingCategories
                .Where(c => categoryNameSet.Contains(c.Name))
                .ToDictionary(c => c.Name, c => c.Id, StringComparer.OrdinalIgnoreCase);

            var productSeeds = new[]
            {
                new
                {
                    Name = "Класическо мече от рози",
                    Description = "Нежно мече от розови листенца с сатенена панделка.",
                    Price = 32.50m,
                    StockQuantity = 28,
                    ImageUrl = "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Мечета от рози",
                    RequiresPrescription = false,
                    ActiveIngredient = "Материал: розови листенца",
                    Dosage = "Размер: 25 см",
                    Manufacturer = "Latelina Gifts",
                    Rating = 4.7m,
                    ReviewCount = 89
                },
                new
                {
                    Name = "Романтично сърце",
                    Description = "Сърце от розови цветчета, готово за подарък.",
                    Price = 27.90m,
                    StockQuantity = 35,
                    ImageUrl = "https://images.pexels.com/photos/3683081/pexels-photo-3683081.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Мечета от рози",
                    RequiresPrescription = false,
                    ActiveIngredient = "Размер: 25 см",
                    Dosage = "Материал: кадифени рози",
                    Manufacturer = "Latelina Gifts",
                    Rating = 4.5m,
                    ReviewCount = 67
                },
                new
                {
                    Name = "Кошница \"Нежност\"",
                    Description = "Подбрани шоколадови бонбони, мини шампанско и картичка.",
                    Price = 48.00m,
                    StockQuantity = 15,
                    ImageUrl = "https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Подаръчни кошници",
                    RequiresPrescription = false,
                    ActiveIngredient = "Съдържание: сладки изненади",
                    Dosage = (string?)null,
                    Manufacturer = "Latelina Gifts",
                    Rating = 4.8m,
                    ReviewCount = 134
                },
                new
                {
                    Name = "Комплект \"Свещи и рози\"",
                    Description = "Две ароматни свещи и мини мече от рози в подаръчна кутия.",
                    Price = 36.50m,
                    StockQuantity = 22,
                    ImageUrl = "https://images.pexels.com/photos/3683083/pexels-photo-3683083.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Романтични комплекти",
                    RequiresPrescription = false,
                    ActiveIngredient = "Аромат: ванилия и божур",
                    Dosage = (string?)null,
                    Manufacturer = "Latelina Gifts",
                    Rating = 4.6m,
                    ReviewCount = 98
                },
                new
                {
                    Name = "Шоколадов дуо сет",
                    Description = "Ръчно подбрани трюфели и бисквити с малини.",
                    Price = 19.50m,
                    StockQuantity = 40,
                    ImageUrl = "https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Сладки изненади",
                    RequiresPrescription = false,
                    ActiveIngredient = "Произход: белгийски шоколад",
                    Dosage = (string?)null,
                    Manufacturer = "Artisan Treats",
                    Rating = 4.3m,
                    ReviewCount = 76
                },
                new
                {
                    Name = "Мини тарталети \"Лате\"",
                    Description = "Кутия с 12 мини тарталети с кафе крем и малини.",
                    Price = 23.80m,
                    StockQuantity = 32,
                    ImageUrl = "https://images.pexels.com/photos/3683050/pexels-photo-3683050.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Сладки изненади",
                    RequiresPrescription = false,
                    ActiveIngredient = "Вкус: кафе и малина",
                    Dosage = (string?)null,
                    Manufacturer = "Latelina Bakery",
                    Rating = 4.4m,
                    ReviewCount = 52
                },
                new
                {
                    Name = "Вечна роза в стъклен купол",
                    Description = "Роза, която запазва красотата си във витринен купол.",
                    Price = 54.90m,
                    StockQuantity = 18,
                    ImageUrl = "https://images.pexels.com/photos/3683110/pexels-photo-3683110.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Декорации",
                    RequiresPrescription = false,
                    ActiveIngredient = "Материал: консервирана роза",
                    Dosage = "Размер: 18 см",
                    Manufacturer = "Latelina Atelier",
                    Rating = 4.9m,
                    ReviewCount = 145
                },
                new
                {
                    Name = "LED лампа \"Луна\"",
                    Description = "Декоративна лампа с меко сияние и дървена основа.",
                    Price = 29.90m,
                    StockQuantity = 30,
                    ImageUrl = "https://images.pexels.com/photos/3683048/pexels-photo-3683048.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Декорации",
                    RequiresPrescription = false,
                    ActiveIngredient = "Материал: полимер + дърво",
                    Dosage = "Диаметър: 15 см",
                    Manufacturer = "Latelina Atelier",
                    Rating = 4.6m,
                    ReviewCount = 87
                },
                new
                {
                    Name = "Комплект за предложение",
                    Description = "Луксозна кутия с рози, място за пръстен и картичка.",
                    Price = 65.00m,
                    StockQuantity = 12,
                    ImageUrl = "https://images.pexels.com/photos/3683099/pexels-photo-3683099.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Специални поводи",
                    RequiresPrescription = false,
                    ActiveIngredient = "Съдържание: рози и място за пръстен",
                    Dosage = (string?)null,
                    Manufacturer = "Latelina Atelier",
                    Rating = 4.7m,
                    ReviewCount = 112
                },
                new
                {
                    Name = "Сет \"Годишнина\"",
                    Description = "Комбинация от мече от рози, шампанско и персонална бележка.",
                    Price = 72.00m,
                    StockQuantity = 10,
                    ImageUrl = "https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg?auto=compress&cs=tinysrgb&w=400",
                    Category = "Специални поводи",
                    RequiresPrescription = false,
                    ActiveIngredient = "Акцент: персонализирана картичка",
                    Dosage = (string?)null,
                    Manufacturer = "Latelina Gifts",
                    Rating = 4.8m,
                    ReviewCount = 156
                }
            };
            var existingProductNames = new HashSet<string>(
                await context.Products.AsNoTracking().Select(p => p.Name).ToListAsync(ct),
                StringComparer.OrdinalIgnoreCase);

            var newProducts = productSeeds
                .Where(seed => categoryDictionary.ContainsKey(seed.Category) && !existingProductNames.Contains(seed.Name))
                .Select(seed => new Product
                {
                    Name = seed.Name,
                    Description = seed.Description,
                    Price = seed.Price,
                    StockQuantity = seed.StockQuantity,
                    ImageUrl = seed.ImageUrl,
                    CategoryId = categoryDictionary[seed.Category],
                    RequiresPrescription = seed.RequiresPrescription,
                    ActiveIngredient = seed.ActiveIngredient,
                    Dosage = seed.Dosage,
                    Manufacturer = seed.Manufacturer,
                    Rating = seed.Rating,
                    ReviewCount = seed.ReviewCount,
                    VatRate = 0.20m
                })
                .ToList();

            if (newProducts.Count > 0)
            {
                await context.Products.AddRangeAsync(newProducts, ct);
                await context.SaveChangesAsync(ct);
                Console.WriteLine($"✅ Seeded {newProducts.Count} demo product(s).");
            }

            var userSeeds = new[]
            {
                new
                {
                    Email = "latelinaproject@gmail.com",
                    FullName = "Latelina Administrator",
                    IsAdmin = true,
                    IsStaff = true,
                    Password = "Admin123!",
                    PhoneNumber = "+359 88 999 0000",
                    Address = "София, бул. Витоша 25",
                    CreatedOffsetMonths = -6,
                    TwoFactorEnabled = false
                },
                new
                {
                    Email = "maria.ivanova@example.com",
                    FullName = "Мария Иванова",
                    IsAdmin = false,
                    IsStaff = false,
                    Password = "Customer123!",
                    PhoneNumber = "+359 88 555 1212",
                    Address = "Пловдив, ул. Капитан Райчо 7",
                    CreatedOffsetMonths = -3,
                    TwoFactorEnabled = true
                },
                new
                {
                    Email = "georgi.petrov@example.com",
                    FullName = "Георги Петров",
                    IsAdmin = false,
                    IsStaff = false,
                    Password = "Customer456!",
                    PhoneNumber = "+359 89 444 2323",
                    Address = "Варна, бул. Сливница 102",
                    CreatedOffsetMonths = -2,
                    TwoFactorEnabled = true
                },
                new
                {
                    Email = "iva.stoyanova@example.com",
                    FullName = "Ива Стоянова",
                    IsAdmin = false,
                    IsStaff = false,
                    Password = "Customer789!",
                    PhoneNumber = "+359 87 333 3434",
                    Address = "Бургас, ул. Александровска 54",
                    CreatedOffsetMonths = -1,
                    TwoFactorEnabled = true
                },
                new
                {
                    Email = "diyana.angelova@example.com",
                    FullName = "Дияна Ангелова",
                    IsAdmin = false,
                    IsStaff = true,
                    Password = "Employee123!",
                    PhoneNumber = "+359 88 321 4455",
                    Address = "София, ул. Иван Вазов 12",
                    CreatedOffsetMonths = -4,
                    TwoFactorEnabled = false
                },
                new
                {
                    Email = "petar.iliev@example.com",
                    FullName = "Петър Илиев",
                    IsAdmin = false,
                    IsStaff = true,
                    Password = "Employee456!",
                    PhoneNumber = "+359 89 210 8899",
                    Address = "Пловдив, бул. Христо Ботев 44",
                    CreatedOffsetMonths = -5,
                    TwoFactorEnabled = false
                }
            };

            var existingUserEmails = new HashSet<string>(
                await context.Users.AsNoTracking().Select(u => u.Email).ToListAsync(ct),
                StringComparer.OrdinalIgnoreCase);

            var now = DateTime.UtcNow;
            var newUsers = userSeeds
                .Where(seed => !existingUserEmails.Contains(seed.Email))
                .Select(seed => new User
                {
                    Email = seed.Email,
                    FullName = seed.FullName,
                    IsAdmin = seed.IsAdmin,
                    IsStaff = seed.IsStaff,
                    PasswordHash = PasswordHasher.Hash(seed.Password),
                    PhoneNumber = seed.PhoneNumber,
                    Address = seed.Address,
                    CreatedAt = now.AddMonths(seed.CreatedOffsetMonths),
                    TwoFactorEnabled = seed.TwoFactorEnabled
                })
                .ToList();

            if (newUsers.Count > 0)
            {
                await context.Users.AddRangeAsync(newUsers, ct);
                await context.SaveChangesAsync(ct);
                Console.WriteLine($"✅ Seeded {newUsers.Count} demo user(s).");
            }

            await EnsureDemoOrdersAsync(context, ct);
        }

        private static async Task EnsureDemoOrdersAsync(LatelinaDbContext context, CancellationToken ct)
        {
            var users = await context.Users
                .AsNoTracking()
                .OrderBy(u => u.CreatedAt)
                .ToListAsync(ct);

            if (users.Count == 0)
            {
                return;
            }

            var referenceProduct = await context.Products
                .AsNoTracking()
                .OrderBy(p => p.Id)
                .FirstOrDefaultAsync(ct);

            if (referenceProduct is null)
            {
                return;
            }

            var userIdsWithOrders = new HashSet<string>(
                await context.Orders
                    .AsNoTracking()
                    .Select(o => o.UserId)
                    .Distinct()
                    .ToListAsync(ct));

            var statuses = new[]
            {
                OrderStatus.Pending,
                OrderStatus.Confirmed,
                OrderStatus.Processing,
                OrderStatus.Shipped,
                OrderStatus.Delivered,
                OrderStatus.Cancelled,
            };

            var now = DateTime.UtcNow;
            var ordersToAdd = new List<Order>();

            for (var index = 0; index < users.Count; index++)
            {
                var user = users[index];

                if (userIdsWithOrders.Contains(user.Id))
                {
                    continue;
                }

                var status = statuses[index % statuses.Length];
                var quantity = (index % 3) + 1;
                var unitPrice = decimal.Round(referenceProduct.Price, 2, MidpointRounding.AwayFromZero);
                var vatRate = referenceProduct.VatRate > 0 ? referenceProduct.VatRate : 0.20m;
                var vatPerUnit = decimal.Round(unitPrice - decimal.Round(unitPrice / (1 + vatRate), 4, MidpointRounding.AwayFromZero), 2, MidpointRounding.AwayFromZero);
                var lineVat = decimal.Round(vatPerUnit * quantity, 2, MidpointRounding.AwayFromZero);
                var lineGross = decimal.Round(unitPrice * quantity, 2, MidpointRounding.AwayFromZero);
                var lineNet = decimal.Round(lineGross - lineVat, 2, MidpointRounding.AwayFromZero);

                var createdAt = now.AddDays(-(index + 1));
                var updatedAt = status switch
                {
                    OrderStatus.Confirmed => createdAt.AddHours(2),
                    OrderStatus.Processing => createdAt.AddHours(4),
                    OrderStatus.Shipped => createdAt.AddHours(6),
                    OrderStatus.Delivered => createdAt.AddHours(24),
                    _ => createdAt,
                };

                var order = new Order
                {
                    UserId = user.Id,
                    OrderNumber = $"DEMO-{createdAt:yyyyMMdd}-{index + 1:D4}",
                    Status = status,
                    PaymentMethod = PaymentMethod.CashOnDelivery,
                    Total = lineGross,
                    Subtotal = lineNet,
                    VatAmount = lineVat,
                    VatRate = vatRate,
                    DeliveryFee = 0m,
                    DeliveryAddress = user.Address,
                    CustomerName = string.IsNullOrWhiteSpace(user.FullName) ? user.Email : user.FullName,
                    CustomerEmail = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Notes = null,
                    CreatedAt = createdAt,
                    UpdatedAt = updatedAt,
                    Items = new List<OrderItem>
                    {
                        new()
                        {
                            ProductId = referenceProduct.Id,
                            Quantity = quantity,
                            UnitPrice = unitPrice,
                            VatRate = vatRate,
                            VatAmount = lineVat,
                            ProductName = referenceProduct.Name,
                            ProductDescription = referenceProduct.Description,
                        }
                    }
                };

                ordersToAdd.Add(order);
            }

            if (ordersToAdd.Count == 0)
            {
                return;
            }

            await context.Orders.AddRangeAsync(ordersToAdd, ct);
            await context.SaveChangesAsync(ct);
            Console.WriteLine($"✅ Seeded {ordersToAdd.Count} demo order(s).");
        }

        private static async Task EnsureAdminTwoFactorDisabledAsync(LatelinaDbContext context, CancellationToken ct)
        {
            var adminUsers = await context.Users
                .Where(u => u.IsAdmin && u.TwoFactorEnabled)
                .ToListAsync(ct);

            if (adminUsers.Count == 0)
            {
                return;
            }

            foreach (var admin in adminUsers)
            {
                admin.TwoFactorEnabled = false;
                admin.TwoFactorEmailCodeHash = null;
                admin.TwoFactorEmailCodeExpiry = null;
                admin.TwoFactorEmailCodeAttempts = 0;
                admin.TwoFactorLastSentAt = null;
                admin.TwoFactorLoginToken = null;
                admin.TwoFactorLoginTokenExpiry = null;
            }

            await context.SaveChangesAsync(ct);

            Console.WriteLine($"✅ Disabled two-factor authentication for {adminUsers.Count} admin account(s).");
        }
    }
}
