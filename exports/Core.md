### C:\AIPharm\AIPharm.Backend\AIPharm.Core\DTOs\AssistantDto.cs
`csharp
namespace AIPharm.Core.DTOs
{
    public class AssistantRequestDto
    {
        public string Question { get; set; } = string.Empty;
        public int? ProductId { get; set; }
    }

    public class AssistantResponseDto
    {
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public int? ProductId { get; set; }
        public DateTime Timestamp { get; set; }
        public string Disclaimer { get; set; } = "вљ пёЏ РўРѕРІР° Рµ РѕР±С‰Р° РёРЅС„РѕСЂРјР°С†РёСЏ. РљРѕРЅСЃСѓР»С‚РёСЂР°Р№С‚Рµ СЃРµ СЃ Р»РµРєР°СЂ.";
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\DTOs\CartDto.cs
`csharp
namespace AIPharm.Core.DTOs
{
    public class CartDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public List<CartItemDto> Items { get; set; } = new();
        public decimal Total { get; set; }
        public int ItemCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CartItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? ActiveIngredient { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class AddToCartDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateCartItemDto
    {
        public int Quantity { get; set; }
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\DTOs\CategoryDto.cs
`csharp
namespace AIPharm.Core.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Icon { get; set; } = string.Empty;
        public int ProductCount { get; set; }
    }

    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Icon { get; set; } = string.Empty;
    }

    public class UpdateCategoryDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Icon { get; set; }
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\DTOs\PagedResultDto.cs
`csharp
namespace AIPharm.Core.DTOs
{
    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\DTOs\ProductDto.cs
`csharp
namespace AIPharm.Core.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public bool RequiresPrescription { get; set; }
        public string? ActiveIngredient { get; set; }
        public string? ActiveIngredientEn { get; set; }
        public string? Dosage { get; set; }
        public string? DosageEn { get; set; }
        public string? Manufacturer { get; set; }
        public string? ManufacturerEn { get; set; }
        public decimal? Rating { get; set; }
        public int ReviewCount { get; set; }
    }

    public class CreateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public int CategoryId { get; set; }
        public bool RequiresPrescription { get; set; }
        public string? ActiveIngredient { get; set; }
        public string? ActiveIngredientEn { get; set; }
        public string? Dosage { get; set; }
        public string? DosageEn { get; set; }
        public string? Manufacturer { get; set; }
        public string? ManufacturerEn { get; set; }
    }

    public class UpdateProductDto
    {
        public string? Name { get; set; }
        public string? NameEn { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public decimal? Price { get; set; }
        public int? StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public int? CategoryId { get; set; }
        public bool? RequiresPrescription { get; set; }
        public string? ActiveIngredient { get; set; }
        public string? ActiveIngredientEn { get; set; }
        public string? Dosage { get; set; }
        public string? DosageEn { get; set; }
        public string? Manufacturer { get; set; }
        public string? ManufacturerEn { get; set; }
    }

    public class ProductFilterDto
    {
        public int? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? SearchTerm { get; set; }
        public bool? RequiresPrescription { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\Interfaces\IAssistantService.cs
`csharp
using AIPharm.Core.DTOs;

namespace AIPharm.Core.Interfaces
{
    public interface IAssistantService
    {
        Task<AssistantResponseDto> AskQuestionAsync(AssistantRequestDto request);
        Task<IEnumerable<AssistantResponseDto>> GetConversationHistoryAsync(string userId);
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\Interfaces\ICartService.cs
`csharp
using AIPharm.Core.DTOs;

namespace AIPharm.Core.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(string userId);
        Task<CartDto> AddToCartAsync(string userId, AddToCartDto addToCartDto);
        Task<CartDto> UpdateCartItemAsync(string userId, int cartItemId, UpdateCartItemDto updateCartItemDto);
        Task<CartDto> RemoveFromCartAsync(string userId, int cartItemId);
        Task<CartDto> ClearCartAsync(string userId);
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\Interfaces\ICategoryService.cs
`csharp
using AIPharm.Core.DTOs;

namespace AIPharm.Core.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetCategoriesAsync();
        Task<CategoryDto?> GetCategoryByIdAsync(int id);
        Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto);
        Task<CategoryDto> UpdateCategoryAsync(int id, UpdateCategoryDto updateCategoryDto);
        Task DeleteCategoryAsync(int id);
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\Interfaces\IProductService.cs
`csharp
using AIPharm.Core.DTOs;

namespace AIPharm.Core.Interfaces
{
    public interface IProductService
    {
        Task<PagedResultDto<ProductDto>> GetProductsAsync(ProductFilterDto filter);
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm);
        Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto);
        Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateProductDto);
        Task DeleteProductAsync(int id);
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\Interfaces\IRepository.cs
`csharp
using System.Linq.Expressions;

namespace AIPharm.Core.Interfaces
{
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(int id);
        Task<T?> GetByIdAsync(string id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
        Task<T> AddAsync(T entity);
        Task<T> UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        Task DeleteAsync(int id);
        Task DeleteAsync(string id);
        Task<int> CountAsync();
        Task<int> CountAsync(Expression<Func<T, bool>> predicate);
        Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\Mapping\MappingProfile.cs
`csharp
using AutoMapper;
using AIPharm.Core.DTOs;
using AIPharm.Domain.Entities;

namespace AIPharm.Core.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Product mappings
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.Ignore());
            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Category mappings
            CreateMap<Category, CategoryDto>()
                .ForMember(dest => dest.ProductCount, opt => opt.Ignore());
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Cart mappings
            CreateMap<ShoppingCart, CartDto>();
            CreateMap<CartItem, CartItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.Ignore())
                .ForMember(dest => dest.ImageUrl, opt => opt.Ignore())
                .ForMember(dest => dest.ActiveIngredient, opt => opt.Ignore());
        }
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\Services\AssistantService.cs
`csharp
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;

namespace AIPharm.Core.Services
{
    public class AssistantService : IAssistantService
    {
        private readonly IRepository<Domain.Entities.Product> _productRepository;

        public AssistantService(IRepository<Domain.Entities.Product> productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<AssistantResponseDto> AskQuestionAsync(AssistantRequestDto request)
        {
            // Simulate AI processing delay
            await Task.Delay(1000 + new Random().Next(2000));

            var response = new AssistantResponseDto
            {
                Question = request.Question,
                ProductId = request.ProductId,
                Timestamp = DateTime.UtcNow,
                Disclaimer = "вљ пёЏ РўРѕРІР° Рµ РѕР±С‰Р° РёРЅС„РѕСЂРјР°С†РёСЏ. РљРѕРЅСЃСѓР»С‚РёСЂР°Р№С‚Рµ СЃРµ СЃ Р»РµРєР°СЂ."
            };

            // Generate contextual response based on question content
            var question = request.Question.ToLower();

            if (question.Contains("РїР°СЂР°С†РµС‚Р°РјРѕР»"))
            {
                response.Answer = "РџР°СЂР°С†РµС‚Р°РјРѕР»СЉС‚ Рµ Р±РµР·РѕРїР°СЃРЅРѕ Рё РµС„РµРєС‚РёРІРЅРѕ РѕР±РµР·Р±РѕР»СЏРІР°С‰Рѕ СЃСЂРµРґСЃС‚РІРѕ. РџСЂРµРїРѕСЂСЉС‡РІР°РЅР°С‚Р° РґРѕР·Р° Р·Р° РІСЉР·СЂР°СЃС‚РЅРё Рµ 500-1000РјРі РЅР° 4-6 С‡Р°СЃР°, РјР°РєСЃРёРјСѓРј 4Рі РґРЅРµРІРЅРѕ. РќРµ С‚СЂСЏР±РІР° РґР° СЃРµ РєРѕРјР±РёРЅРёСЂР° СЃ Р°Р»РєРѕС…РѕР» Рё РґСЂСѓРіРё Р»РµРєР°СЂСЃС‚РІР° СЃСЉРґСЉСЂР¶Р°С‰Рё РїР°СЂР°С†РµС‚Р°РјРѕР».";
            }
            else if (question.Contains("РёР±СѓРїСЂРѕС„РµРЅ"))
            {
                response.Answer = "РР±СѓРїСЂРѕС„РµРЅСЉС‚ Рµ РЅРµСЃС‚РµСЂРѕРёРґРЅРѕ РїСЂРѕС‚РёРІРѕРІСЉР·РїР°Р»РёС‚РµР»РЅРѕ СЃСЂРµРґСЃС‚РІРѕ (РќРџР’РЎ). РџСЂРµРїРѕСЂСЉС‡РІР° СЃРµ РїСЂРёРµРј СЃ С…СЂР°РЅР° Р·Р° РїСЂРµРґРїР°Р·РІР°РЅРµ РЅР° СЃС‚РѕРјР°С…Р°. РќРµ СЃРµ РїСЂРµРїРѕСЂСЉС‡РІР° РїСЂРё СЏР·РІР°, Р±СЉР±СЂРµС‡РЅРё РїСЂРѕР±Р»РµРјРё РёР»Рё Р°Р»РµСЂРіРёСЏ РєСЉРј РќРџР’РЎ.";
            }
            else if (question.Contains("РІРёС‚Р°РјРёРЅ"))
            {
                response.Answer = "Р’РёС‚Р°РјРёРЅРёС‚Рµ СЃР° РІР°Р¶РЅРё Р·Р° РїРѕРґРґСЉСЂР¶Р°РЅРµ РЅР° Р·РґСЂР°РІРµС‚Рѕ. РџСЂРµРїРѕСЂСЉС‡РІР°Рј РґР° СЃРµ РїСЂРёРµРјР°С‚ СЃРїРѕСЂРµРґ СѓРєР°Р·Р°РЅРёСЏС‚Р° РЅР° РѕРїР°РєРѕРІРєР°С‚Р°. РџСЂРё Р±Р°Р»Р°РЅСЃРёСЂР°РЅРѕ С…СЂР°РЅРµРЅРµ, РґРѕРїСЉР»РЅРёС‚РµР»РЅРёСЏС‚ РїСЂРёРµРј РјРѕР¶Рµ РґР° РЅРµ Рµ РЅРµРѕР±С…РѕРґРёРј.";
            }
            else if (question.Contains("РґРѕР·РёСЂРѕРІРєР°") || question.Contains("РґРѕР·Р°"))
            {
                response.Answer = "Р”РѕР·РёСЂРѕРІРєР°С‚Р° Р·Р°РІРёСЃРё РѕС‚ РєРѕРЅРєСЂРµС‚РЅРѕС‚Рѕ Р»РµРєР°СЂСЃС‚РІРѕ, РІСЉР·СЂР°СЃС‚С‚Р° Рё С‚РµРіР»РѕС‚Рѕ РЅР° РїР°С†РёРµРЅС‚Р°. Р’РёРЅР°РіРё СЃР»РµРґРІР°Р№С‚Рµ СѓРєР°Р·Р°РЅРёСЏС‚Р° РЅР° РѕРїР°РєРѕРІРєР°С‚Р° РёР»Рё СЃСЉРІРµС‚РёС‚Рµ РЅР° Р»РµРєР°СЂСЏ. РџСЂРё СЃСЉРјРЅРµРЅРёСЏ СЃРµ РєРѕРЅСЃСѓР»С‚РёСЂР°Р№С‚Рµ СЃ С„Р°СЂРјР°С†РµРІС‚.";
            }
            else if (question.Contains("СЃС‚СЂР°РЅРёС‡РЅРё РµС„РµРєС‚Рё"))
            {
                response.Answer = "Р’СЃСЏРєРѕ Р»РµРєР°СЂСЃС‚РІРѕ РјРѕР¶Рµ РґР° РёРјР° СЃС‚СЂР°РЅРёС‡РЅРё РµС„РµРєС‚Рё. РќР°Р№-С‡РµСЃС‚РёС‚Рµ СЃР° РѕРїРёСЃР°РЅРё РІ Р»РёСЃС‚РѕРІРєР°С‚Р°. РџСЂРё РїРѕСЏРІР°С‚Р° РЅР° РЅРµРѕР±РёС‡Р°Р№РЅРё СЃРёРјРїС‚РѕРјРё СЃРїСЂРµС‚Рµ РїСЂРёРµРјР° Рё СЃРµ РєРѕРЅСЃСѓР»С‚РёСЂР°Р№С‚Рµ СЃ Р»РµРєР°СЂ.";
            }
            else
            {
                var responses = new[]
                {
                    "РЎРїРѕСЂРµРґ РјРµРґРёС†РёРЅСЃРєР°С‚Р° РёРЅС„РѕСЂРјР°С†РёСЏ, РєРѕСЏС‚Рѕ СЂР°Р·РїРѕР»Р°РіР°Рј, С‚РѕР·Рё РїСЂРѕРґСѓРєС‚ СЃРµ РёР·РїРѕР»Р·РІР° Р±РµР·РѕРїР°СЃРЅРѕ РїСЂРё СЃРїР°Р·РІР°РЅРµ РЅР° СѓРєР°Р·Р°РЅРёСЏС‚Р° Р·Р° РґРѕР·РёСЂР°РЅРµ.",
                    "Р‘Р°Р·РёСЂР°РЅРѕ РЅР° Р°РєС‚РёРІРЅРёС‚Рµ СЃСЉСЃС‚Р°РІРєРё, РјРѕРіР° РґР° РєР°Р¶Р°, С‡Рµ РїСЂРµРїРѕСЂСЉС‡РІР°Рј РґР° СЃРµ РєРѕРЅСЃСѓР»С‚РёСЂР°С‚Рµ СЃ Р»РµРєР°СЂ РёР»Рё С„Р°СЂРјР°С†РµРІС‚ РїСЂРµРґРё СѓРїРѕС‚СЂРµР±Р°.",
                    "РћС‚ С„Р°СЂРјР°РєРѕР»РѕРіРёС‡РЅР° РіР»РµРґРЅР° С‚РѕС‡РєР°, РІР°Р¶РЅРѕ Рµ РґР° РїСЂРѕС‡РµС‚РµС‚Рµ РІРЅРёРјР°С‚РµР»РЅРѕ Р»РёСЃС‚РѕРІРєР°С‚Р° РІ РѕРїР°РєРѕРІРєР°С‚Р°.",
                    "РЎРїРѕСЂРµРґ РєР»РёРЅРёС‡РЅРёС‚Рµ РґР°РЅРЅРё, РјРѕР¶Рµ РґР° РёРјР° РІР·Р°РёРјРѕРґРµР№СЃС‚РІРёСЏ СЃ РґСЂСѓРіРё Р»РµРєР°СЂСЃС‚РІР°, РєРѕРёС‚Рѕ РїСЂРёРµРјР°С‚Рµ."
                };

                response.Answer = responses[new Random().Next(responses.Length)] + " Р’РёРЅР°РіРё СЃРµ РєРѕРЅСЃСѓР»С‚РёСЂР°Р№С‚Рµ СЃ РјРµРґРёС†РёРЅСЃРєРё СЃРїРµС†РёР°Р»РёСЃС‚ Р·Р° РїРµСЂСЃРѕРЅР°Р»РёР·РёСЂР°РЅ СЃСЉРІРµС‚.";
            }

            return response;
        }

        public async Task<IEnumerable<AssistantResponseDto>> GetConversationHistoryAsync(string userId)
        {
            // In a real implementation, this would fetch from a database
            // For now, return empty list
            await Task.CompletedTask;
            return new List<AssistantResponseDto>();
        }
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\Services\CartService.cs
`csharp
using AutoMapper;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;

namespace AIPharm.Core.Services
{
    public class CartService : ICartService
    {
        private readonly IRepository<ShoppingCart> _cartRepository;
        private readonly IRepository<CartItem> _cartItemRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IMapper _mapper;

        public CartService(
            IRepository<ShoppingCart> cartRepository,
            IRepository<CartItem> cartItemRepository,
            IRepository<Product> productRepository,
            IMapper mapper)
        {
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _productRepository = productRepository;
            _mapper = mapper;
        }

        public async Task<CartDto> GetCartAsync(string userId)
        {
            var cart = await _cartRepository.FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart == null)
            {
                cart = new ShoppingCart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                cart = await _cartRepository.AddAsync(cart);
            }

            var cartItems = await _cartItemRepository.FindAsync(ci => ci.ShoppingCartId == cart.Id);
            var cartDto = _mapper.Map<CartDto>(cart);
            
            foreach (var item in cartItems)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product != null)
                {
                    var cartItemDto = new CartItemDto
                    {
                        Id = item.Id,
                        ProductId = item.ProductId,
                        ProductName = product.Name,
                        ImageUrl = product.ImageUrl,
                        ActiveIngredient = product.ActiveIngredient,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.TotalPrice
                    };
                    cartDto.Items.Add(cartItemDto);
                }
            }

            cartDto.Total = cartDto.Items.Sum(i => i.TotalPrice);
            cartDto.ItemCount = cartDto.Items.Sum(i => i.Quantity);

            return cartDto;
        }

        public async Task<CartDto> AddToCartAsync(string userId, AddToCartDto addToCartDto)
        {
            var product = await _productRepository.GetByIdAsync(addToCartDto.ProductId);
            if (product == null)
                throw new ArgumentException("Product not found");

            if (product.StockQuantity < addToCartDto.Quantity)
                throw new InvalidOperationException("Insufficient stock");

            var cart = await _cartRepository.FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart == null)
            {
                cart = new ShoppingCart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                cart = await _cartRepository.AddAsync(cart);
            }

            var existingItem = await _cartItemRepository.FirstOrDefaultAsync(ci => 
                ci.ShoppingCartId == cart.Id && ci.ProductId == addToCartDto.ProductId);

            if (existingItem != null)
            {
                existingItem.Quantity += addToCartDto.Quantity;
                existingItem.UpdatedAt = DateTime.UtcNow;
                await _cartItemRepository.UpdateAsync(existingItem);
            }
            else
            {
                var cartItem = new CartItem
                {
                    ShoppingCartId = cart.Id,
                    ProductId = addToCartDto.ProductId,
                    Quantity = addToCartDto.Quantity,
                    UnitPrice = product.Price,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _cartItemRepository.AddAsync(cartItem);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _cartRepository.UpdateAsync(cart);

            return await GetCartAsync(userId);
        }

        public async Task<CartDto> UpdateCartItemAsync(string userId, int cartItemId, UpdateCartItemDto updateCartItemDto)
        {
            var cartItem = await _cartItemRepository.GetByIdAsync(cartItemId);
            if (cartItem == null)
                throw new ArgumentException("Cart item not found");

            var cart = await _cartRepository.GetByIdAsync(cartItem.ShoppingCartId);
            if (cart == null || cart.UserId != userId)
                throw new UnauthorizedAccessException("Cart item does not belong to user");

            if (updateCartItemDto.Quantity <= 0)
            {
                await _cartItemRepository.DeleteAsync(cartItem);
            }
            else
            {
                var product = await _productRepository.GetByIdAsync(cartItem.ProductId);
                if (product != null && product.StockQuantity < updateCartItemDto.Quantity)
                    throw new InvalidOperationException("Insufficient stock");

                cartItem.Quantity = updateCartItemDto.Quantity;
                cartItem.UpdatedAt = DateTime.UtcNow;
                await _cartItemRepository.UpdateAsync(cartItem);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _cartRepository.UpdateAsync(cart);

            return await GetCartAsync(userId);
        }

        public async Task<CartDto> RemoveFromCartAsync(string userId, int cartItemId)
        {
            var cartItem = await _cartItemRepository.GetByIdAsync(cartItemId);
            if (cartItem == null)
                throw new ArgumentException("Cart item not found");

            var cart = await _cartRepository.GetByIdAsync(cartItem.ShoppingCartId);
            if (cart == null || cart.UserId != userId)
                throw new UnauthorizedAccessException("Cart item does not belong to user");

            await _cartItemRepository.DeleteAsync(cartItem);

            cart.UpdatedAt = DateTime.UtcNow;
            await _cartRepository.UpdateAsync(cart);

            return await GetCartAsync(userId);
        }

        public async Task<CartDto> ClearCartAsync(string userId)
        {
            var cart = await _cartRepository.FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart != null)
            {
                var cartItems = await _cartItemRepository.FindAsync(ci => ci.ShoppingCartId == cart.Id);
                foreach (var item in cartItems)
                {
                    await _cartItemRepository.DeleteAsync(item);
                }

                cart.UpdatedAt = DateTime.UtcNow;
                await _cartRepository.UpdateAsync(cart);
            }

            return await GetCartAsync(userId);
        }
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\Services\CategoryService.cs
`csharp
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
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Core\Services\ProductService.cs
`csharp
using AutoMapper;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;

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
            var query = await _productRepository.GetAllAsync();
            var products = query.AsQueryable();

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

            var totalCount = products.Count();
            var pagedProducts = products
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToList();

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
            var product = _mapper.Map<Product>(createProductDto);
            product.CreatedAt = DateTime.UtcNow;
            product.UpdatedAt = DateTime.UtcNow;

            var createdProduct = await _productRepository.AddAsync(product);
            return _mapper.Map<ProductDto>(createdProduct);
        }

        public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateProductDto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                throw new ArgumentException($"Product with ID {id} not found");

            _mapper.Map(updateProductDto, product);
            product.UpdatedAt = DateTime.UtcNow;

            var updatedProduct = await _productRepository.UpdateAsync(product);
            return _mapper.Map<ProductDto>(updatedProduct);
        }

        public async Task DeleteProductAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                throw new ArgumentException($"Product with ID {id} not found");

            product.IsDeleted = true;
            product.UpdatedAt = DateTime.UtcNow;
            await _productRepository.UpdateAsync(product);
        }
    }
}
``r

