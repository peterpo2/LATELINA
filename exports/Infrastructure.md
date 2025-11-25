### C:\AIPharm\AIPharm.Backend\AIPharm.Infrastructure\Data\AIPharmDbContext.cs
`csharp
using Microsoft.EntityFrameworkCore;
using AIPharm.Domain.Entities;

namespace AIPharm.Infrastructure.Data
{
    public class AIPharmDbContext : DbContext
    {
        public AIPharmDbContext(DbContextOptions<AIPharmDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ShoppingCart> ShoppingCarts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired();
            });

            // Category configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Icon).IsRequired().HasMaxLength(50);
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            // Product configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Price).HasColumnType("decimal(10,2)");
                entity.Property(e => e.Rating).HasColumnType("decimal(3,2)");
                
                entity.HasOne(e => e.Category)
                      .WithMany(e => e.Products)
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            // ShoppingCart configuration
            modelBuilder.Entity<ShoppingCart>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                      .WithMany(e => e.ShoppingCarts)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // CartItem configuration
            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UnitPrice).HasColumnType("decimal(10,2)");
                
                entity.HasOne(e => e.ShoppingCart)
                      .WithMany(e => e.Items)
                      .HasForeignKey(e => e.ShoppingCartId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.Product)
                      .WithMany(e => e.CartItems)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Order configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Total).HasColumnType("decimal(10,2)");
                entity.Property(e => e.DeliveryFee).HasColumnType("decimal(10,2)");
                
                entity.HasOne(e => e.User)
                      .WithMany(e => e.Orders)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // OrderItem configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UnitPrice).HasColumnType("decimal(10,2)");
                entity.Property(e => e.ProductName).IsRequired().HasMaxLength(200);
                
                entity.HasOne(e => e.Order)
                      .WithMany(e => e.Items)
                      .HasForeignKey(e => e.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.Product)
                      .WithMany(e => e.OrderItems)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed data
            // Seed data is now handled by DbInitializer
        }
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Infrastructure\Data\DbInitializer.cs
`csharp
using AIPharm.Domain.Entities;
using AIPharm.Infrastructure.Data;

namespace AIPharm.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AIPharmDbContext context)
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // Check if data already exists
            if (context.Categories.Any())
            {
                return; // Database has been seeded
            }

            // Seed Categories
            var categories = new[]
            {
                new Category { Id = 1, Name = "РћР±РµР·Р±РѕР»СЏРІР°С‰Рё", Description = "Р›РµРєР°СЂСЃС‚РІР° Р·Р° РѕР±Р»РµРєС‡Р°РІР°РЅРµ РЅР° Р±РѕР»РєР° Рё РІСЉР·РїР°Р»РµРЅРёРµ", Icon = "pill" },
                new Category { Id = 2, Name = "Р’РёС‚Р°РјРёРЅРё", Description = "РҐСЂР°РЅРёС‚РµР»РЅРё РґРѕР±Р°РІРєРё Рё РІРёС‚Р°РјРёРЅРё", Icon = "heart" },
                new Category { Id = 3, Name = "РџСЂРѕСЃС‚СѓРґР° Рё РіСЂРёРї", Description = "Р›РµРєР°СЂСЃС‚РІР° Р·Р° РїСЂРѕСЃС‚СѓРґР°, РєР°С€Р»РёС†Р° Рё РіСЂРёРї", Icon = "thermometer" },
                new Category { Id = 4, Name = "РЎС‚РѕРјР°С€РЅРѕ-С‡СЂРµРІРЅРё", Description = "Р›РµРєР°СЂСЃС‚РІР° Р·Р° С…СЂР°РЅРѕСЃРјРёР»Р°С‚РµР»РЅРё РїСЂРѕР±Р»РµРјРё", Icon = "stomach" },
                new Category { Id = 5, Name = "РљРѕР¶Р° Рё РєРѕСЃР°", Description = "РљРѕР·РјРµС‚РёРєР° Рё РґРµСЂРјР°С‚Рѕ-РєРѕР·РјРµС‚РёС‡РЅРё РїСЂРѕРґСѓРєС‚Рё", Icon = "droplet" },
                new Category { Id = 6, Name = "Р”РµС‚СЃРєРё РїСЂРѕРґСѓРєС‚Рё", Description = "РЎРїРµС†РёР°Р»РёР·РёСЂР°РЅРё РїСЂРѕРґСѓРєС‚Рё Р·Р° РґРµС†Р°", Icon = "baby" }
            };

            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();

            // Seed Products
            var products = new[]
            {
                new Product
                {
                    Id = 1,
                    Name = "РџР°СЂР°С†РµС‚Р°РјРѕР» 500РјРі",
                    NameEn = "Paracetamol 500mg",
                    Description = "Р•С„РµРєС‚РёРІРЅРѕ РѕР±РµР·Р±РѕР»СЏРІР°С‰Рѕ Рё Р¶Р°СЂРѕРїРѕРЅРёР¶Р°РІР°С‰Рѕ СЃСЂРµРґСЃС‚РІРѕ Р·Р° РІСЉР·СЂР°СЃС‚РЅРё Рё РґРµС†Р° РЅР°Рґ 12 РіРѕРґРёРЅРё",
                    DescriptionEn = "Effective pain reliever and fever reducer for adults and children over 12 years",
                    Price = 2.30m,
                    StockQuantity = 150,
                    ImageUrl = "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 1,
                    RequiresPrescription = false,
                    ActiveIngredient = "РџР°СЂР°С†РµС‚Р°РјРѕР»",
                    ActiveIngredientEn = "Paracetamol",
                    Dosage = "500РјРі",
                    DosageEn = "500mg",
                    Manufacturer = "РђРєС‚Р°РІРёСЃ",
                    ManufacturerEn = "Actavis",
                    Rating = 4.7m,
                    ReviewCount = 89
                },
                new Product
                {
                    Id = 2,
                    Name = "РР±СѓРїСЂРѕС„РµРЅ 400РјРі",
                    NameEn = "Ibuprofen 400mg",
                    Description = "РџСЂРѕС‚РёРІРѕРІСЉР·РїР°Р»РёС‚РµР»РЅРѕ Рё РѕР±РµР·Р±РѕР»СЏРІР°С‰Рѕ СЃСЂРµРґСЃС‚РІРѕ Р·Р° РјСѓСЃРєСѓР»РЅРё Рё СЃС‚Р°РІРЅРё Р±РѕР»РєРё",
                    DescriptionEn = "Anti-inflammatory and pain relief for muscle and joint pain",
                    Price = 3.17m,
                    StockQuantity = 95,
                    ImageUrl = "https://images.pexels.com/photos/3683081/pexels-photo-3683081.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 1,
                    RequiresPrescription = false,
                    ActiveIngredient = "РР±СѓРїСЂРѕС„РµРЅ",
                    ActiveIngredientEn = "Ibuprofen",
                    Dosage = "400РјРі",
                    DosageEn = "400mg",
                    Manufacturer = "РќСѓРІРёС‚Р° Р¤Р°СЂРјР°",
                    ManufacturerEn = "Nuvita Pharma",
                    Rating = 4.5m,
                    ReviewCount = 67
                },
                new Product
                {
                    Id = 3,
                    Name = "Р’РёС‚Р°РјРёРЅ C 1000РјРі",
                    NameEn = "Vitamin C 1000mg",
                    Description = "Р’РёСЃРѕРєРѕРґРѕР·РѕРІ РІРёС‚Р°РјРёРЅ C Р·Р° СѓРєСЂРµРїРІР°РЅРµ РЅР° РёРјСѓРЅРЅР°С‚Р° СЃРёСЃС‚РµРјР°",
                    DescriptionEn = "High-dose vitamin C for immune system strengthening",
                    Price = 6.54m,
                    StockQuantity = 200,
                    ImageUrl = "https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 2,
                    RequiresPrescription = false,
                    ActiveIngredient = "РђСЃРєРѕСЂР±РёРЅРѕРІР° РєРёСЃРµР»РёРЅР°",
                    ActiveIngredientEn = "Ascorbic Acid",
                    Dosage = "1000РјРі",
                    DosageEn = "1000mg",
                    Manufacturer = "РЎРѕР»РіР°СЂ",
                    ManufacturerEn = "Solgar",
                    Rating = 4.8m,
                    ReviewCount = 134
                },
                new Product
                {
                    Id = 4,
                    Name = "РњР°РіРЅРµР·РёР№ + Р’РёС‚Р°РјРёРЅ B6",
                    NameEn = "Magnesium + Vitamin B6",
                    Description = "РљРѕРјР±РёРЅР°С†РёСЏ Р·Р° РЅРµСЂРІРЅР°С‚Р° СЃРёСЃС‚РµРјР° Рё РјСѓСЃРєСѓР»РЅР°С‚Р° С„СѓРЅРєС†РёСЏ",
                    DescriptionEn = "Combination for nervous system and muscle function",
                    Price = 7.98m,
                    StockQuantity = 75,
                    ImageUrl = "https://images.pexels.com/photos/3683083/pexels-photo-3683083.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 2,
                    RequiresPrescription = false,
                    ActiveIngredient = "РњР°РіРЅРµР·РёР№ РѕРєСЃРёРґ, РџРёСЂРёРґРѕРєСЃРёРЅ",
                    ActiveIngredientEn = "Magnesium Oxide, Pyridoxine",
                    Dosage = "375РјРі + 2РјРі",
                    DosageEn = "375mg + 2mg",
                    Manufacturer = "РќР°С‚СѓСЂР° Р’РёС‚Р°",
                    ManufacturerEn = "Natura Vita",
                    Rating = 4.6m,
                    ReviewCount = 98
                },
                new Product
                {
                    Id = 5,
                    Name = "РЎРёСЂРѕРї Р·Р° РєР°С€Р»РёС†Р°",
                    NameEn = "Cough Syrup",
                    Description = "Р‘РёР»РєРѕРІ СЃРёСЂРѕРї Р·Р° СЃСѓС…Рѕ РіСЉСЂР»Рѕ Рё РєР°С€Р»РёС†Р°",
                    DescriptionEn = "Herbal syrup for dry throat and cough",
                    Price = 4.55m,
                    StockQuantity = 120,
                    ImageUrl = "https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 3,
                    RequiresPrescription = false,
                    ActiveIngredient = "Р•РєСЃС‚СЂР°РєС‚ РѕС‚ РјРµРґ Рё Р»РёРјРѕРЅ",
                    ActiveIngredientEn = "Honey and Lemon Extract",
                    Dosage = "15РјР» 3 РїСЉС‚Рё РґРЅРµРІРЅРѕ",
                    DosageEn = "15ml 3 times daily",
                    Manufacturer = "РҐРµСЂР±Р°Р» РњРµРґРёРєР°",
                    ManufacturerEn = "Herbal Medica",
                    Rating = 4.3m,
                    ReviewCount = 76
                },
                new Product
                {
                    Id = 6,
                    Name = "РќР°Р·Р°Р»РµРЅ СЃРїСЂРµР№",
                    NameEn = "Nasal Spray",
                    Description = "Р—Р° Р·Р°Р»РѕР¶РµРЅ РЅРѕСЃ РїСЂРё РїСЂРѕСЃС‚СѓРґР° Рё Р°Р»РµСЂРіРёРё",
                    DescriptionEn = "For nasal congestion due to cold and allergies",
                    Price = 5.83m,
                    StockQuantity = 85,
                    ImageUrl = "https://images.pexels.com/photos/3683050/pexels-photo-3683050.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 3,
                    RequiresPrescription = false,
                    ActiveIngredient = "РљСЃРёР»РѕРјРµС‚Р°Р·РѕР»РёРЅ",
                    ActiveIngredientEn = "Xylometazoline",
                    Dosage = "0.1%",
                    DosageEn = "0.1%",
                    Manufacturer = "Р РёРЅРѕ Р¤Р°СЂРј",
                    ManufacturerEn = "Rhino Pharm",
                    Rating = 4.4m,
                    ReviewCount = 52
                },
                new Product
                {
                    Id = 7,
                    Name = "РџСЂРѕР±РёРѕС‚РёРє РєРѕРјРїР»РµРєСЃ",
                    NameEn = "Probiotic Complex",
                    Description = "Р—Р° Р·РґСЂР°РІРѕСЃР»РѕРІРЅР° С‡СЂРµРІРЅР° С„Р»РѕСЂР° Рё РїРѕРґРѕР±СЂРµРЅРѕ С…СЂР°РЅРѕСЃРјРёР»Р°РЅРµ",
                    DescriptionEn = "For healthy intestinal flora and improved digestion",
                    Price = 11.50m,
                    StockQuantity = 60,
                    ImageUrl = "https://images.pexels.com/photos/3683110/pexels-photo-3683110.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 4,
                    RequiresPrescription = false,
                    ActiveIngredient = "Р›Р°РєС‚РѕР±Р°С†РёР»Рё Рё Р±РёС„РёРґРѕР±Р°РєС‚РµСЂРёРё",
                    ActiveIngredientEn = "Lactobacilli and Bifidobacteria",
                    Dosage = "1 РєР°РїСЃСѓР»Р° РґРЅРµРІРЅРѕ",
                    DosageEn = "1 capsule daily",
                    Manufacturer = "Р‘РёРѕРџСЂРѕ",
                    ManufacturerEn = "BioPro",
                    Rating = 4.9m,
                    ReviewCount = 145
                },
                new Product
                {
                    Id = 8,
                    Name = "РђРЅС‚РёР°С†РёРґ С‚Р°Р±Р»РµС‚РєРё",
                    NameEn = "Antacid Tablets",
                    Description = "Р—Р° РєРёСЃРµР»РёРЅРё Рё СЃС‚РѕРјР°С€РЅРё СЂР°Р·СЃС‚СЂРѕР№СЃС‚РІР°",
                    DescriptionEn = "For acidity and stomach disorders",
                    Price = 3.99m,
                    StockQuantity = 110,
                    ImageUrl = "https://images.pexels.com/photos/3683048/pexels-photo-3683048.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 4,
                    RequiresPrescription = false,
                    ActiveIngredient = "РђР»СѓРјРёРЅРёРµРІ С…РёРґСЂРѕРєСЃРёРґ",
                    ActiveIngredientEn = "Aluminum Hydroxide",
                    Dosage = "500РјРі",
                    DosageEn = "500mg",
                    Manufacturer = "Р“Р°СЃС‚СЂРѕРњРµРґ",
                    ManufacturerEn = "GastroMed",
                    Rating = 4.2m,
                    ReviewCount = 43
                },
                new Product
                {
                    Id = 9,
                    Name = "РҐРёРґСЂР°С‚РёСЂР°С‰ РєСЂРµРј",
                    NameEn = "Moisturizing Cream",
                    Description = "Р—Р° СЃСѓС…Р° Рё С‡СѓРІСЃС‚РІРёС‚РµР»РЅР° РєРѕР¶Р° РЅР° Р»РёС†РµС‚Рѕ Рё С‚СЏР»РѕС‚Рѕ",
                    DescriptionEn = "For dry and sensitive skin on face and body",
                    Price = 9.66m,
                    StockQuantity = 90,
                    ImageUrl = "https://images.pexels.com/photos/3683099/pexels-photo-3683099.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 5,
                    RequiresPrescription = false,
                    ActiveIngredient = "РҐРёР°Р»СѓСЂРѕРЅРѕРІР° РєРёСЃРµР»РёРЅР°",
                    ActiveIngredientEn = "Hyaluronic Acid",
                    Dosage = "РќР°РЅР°СЃСЏРЅРµ 2 РїСЉС‚Рё РґРЅРµРІРЅРѕ",
                    DosageEn = "Apply 2 times daily",
                    Manufacturer = "РЎРєРёРЅРљРµСЉСЂ",
                    ManufacturerEn = "SkinCare",
                    Rating = 4.7m,
                    ReviewCount = 112
                },
                new Product
                {
                    Id = 10,
                    Name = "РЎР»СЉРЅС†РµР·Р°С‰РёС‚РµРЅ РєСЂРµРј SPF50",
                    NameEn = "Sunscreen Cream SPF50",
                    Description = "Р’РёСЃРѕРєР° Р·Р°С‰РёС‚Р° РѕС‚ UV Р»СЉС‡Рё Р·Р° Р»РёС†Рµ Рё С‚СЏР»Рѕ",
                    DescriptionEn = "High protection from UV rays for face and body",
                    Price = 13.09m,
                    StockQuantity = 75,
                    ImageUrl = "https://images.pexels.com/photos/3683096/pexels-photo-3683096.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 5,
                    RequiresPrescription = false,
                    ActiveIngredient = "Р¦РёРЅРєРѕРІ РѕРєСЃРёРґ, РўРёС‚Р°РЅРѕРІ РґРёРѕРєСЃРёРґ",
                    ActiveIngredientEn = "Zinc Oxide, Titanium Dioxide",
                    Dosage = "РќР°РЅР°СЃСЏРЅРµ РїСЂРµРґРё РёР·Р»Р°РіР°РЅРµ РЅР° СЃР»СЉРЅС†Рµ",
                    DosageEn = "Apply before sun exposure",
                    Manufacturer = "РЎСЉРЅРџСЂРѕС‚РµРєС‚",
                    ManufacturerEn = "SunProtect",
                    Rating = 4.6m,
                    ReviewCount = 87
                },
                new Product
                {
                    Id = 11,
                    Name = "Р”РµС‚СЃРєРё СЃРёСЂРѕРї РїР°СЂР°С†РµС‚Р°РјРѕР»",
                    NameEn = "Children Paracetamol Syrup",
                    Description = "РћР±РµР·Р±РѕР»СЏРІР°С‰Рѕ Рё Р¶Р°СЂРѕРїРѕРЅРёР¶Р°РІР°С‰Рѕ Р·Р° РґРµС†Р° РѕС‚ 3 РјРµСЃРµС†Р°",
                    DescriptionEn = "Pain reliever and fever reducer for children from 3 months",
                    Price = 4.70m,
                    StockQuantity = 100,
                    ImageUrl = "https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 6,
                    RequiresPrescription = false,
                    ActiveIngredient = "РџР°СЂР°С†РµС‚Р°РјРѕР»",
                    ActiveIngredientEn = "Paracetamol",
                    Dosage = "120РјРі/5РјР»",
                    DosageEn = "120mg/5ml",
                    Manufacturer = "РљРёРґsCare",
                    ManufacturerEn = "KidsCare",
                    Rating = 4.8m,
                    ReviewCount = 156
                },
                new Product
                {
                    Id = 12,
                    Name = "Р”РµС‚СЃРєРё РІРёС‚Р°РјРёРЅРё",
                    NameEn = "Children Vitamins",
                    Description = "РњСѓР»С‚РёРІРёС‚Р°РјРёРЅРё СЃ РїСЂРёСЏС‚РµРЅ РІРєСѓСЃ РЅР° СЏРіРѕРґР°",
                    DescriptionEn = "Multivitamins with pleasant strawberry flavor",
                    Price = 8.38m,
                    StockQuantity = 80,
                    ImageUrl = "https://images.pexels.com/photos/3683106/pexels-photo-3683106.jpeg?auto=compress&cs=tinysrgb&w=400",
                    CategoryId = 6,
                    RequiresPrescription = false,
                    ActiveIngredient = "Р’РёС‚Р°РјРёРЅРё A, C, D, E",
                    ActiveIngredientEn = "Vitamins A, C, D, E",
                    Dosage = "1 С‚Р°Р±Р»РµС‚РєР° РґРЅРµРІРЅРѕ",
                    DosageEn = "1 tablet daily",
                    Manufacturer = "JuniorVit",
                    ManufacturerEn = "JuniorVit",
                    Rating = 4.5m,
                    ReviewCount = 92
                }
            };

            context.Products.AddRange(products);
            await context.SaveChangesAsync();

            // Seed Users
            var users = new[]
            {
                new User
                {
                    Id = "admin-user-id",
                    Email = "aipharmproject@gmail.com",
                    FullName = "РђРґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ",
                    IsAdmin = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = "demo-user-id",
                    Email = "maria.ivanova@example.com",
                    FullName = "Р”РµРјРѕ РџРѕС‚СЂРµР±РёС‚РµР»",
                    IsAdmin = false,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Users.AddRange(users);
            await context.SaveChangesAsync();

            Console.WriteLine("Database seeded successfully!");
        }
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Infrastructure\Repositories\Repository.cs
`csharp
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using AIPharm.Core.Interfaces;
using AIPharm.Infrastructure.Data;

namespace AIPharm.Infrastructure.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly AIPharmDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(AIPharmDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public virtual async Task<T?> GetByIdAsync(string id)
        {
            return await _dbSet.FindAsync(id);
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.FirstOrDefaultAsync(predicate);
        }

        public virtual async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<T> UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task DeleteAsync(T entity)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public virtual async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                await DeleteAsync(entity);
            }
        }

        public virtual async Task DeleteAsync(string id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                await DeleteAsync(entity);
            }
        }

        public virtual async Task<int> CountAsync()
        {
            return await _dbSet.CountAsync();
        }

        public virtual async Task<int> CountAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.CountAsync(predicate);
        }

        public virtual async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.AnyAsync(predicate);
        }
    }
}
``r

