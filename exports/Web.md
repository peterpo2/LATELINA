### C:\AIPharm\AIPharm.Backend\AIPharm.Web\Program.cs
`csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using AIPharm.Infrastructure.Data;
using AIPharm.Infrastructure.Repositories;
using AIPharm.Core.Interfaces;
using AIPharm.Core.Services;
using AIPharm.Core.Mapping;

var builder = WebApplication.CreateBuilder(args);

// Basic API services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };
    });

builder.Services.AddAuthorization();

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// EF Core
builder.Services.AddDbContextPool<AIPharmDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repos & services
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IAssistantService, AssistantService>(); 
builder.Services.AddHealthChecks().AddDbContextCheck<AIPharmDbContext>("db");


// CORS for local & docker dev
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://frontend:3000",
                "http://aipharm-frontend:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    );
});

// Health checks (simple)
builder.Services.AddHealthChecks();

var app = builder.Build();

// Swagger – keep on in dev
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "AIPharm API v1");
});

// In Docker you typically set ASPNETCORE_ENVIRONMENT=Development; skip HTTPS redirect then
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// root ping + health
app.MapGet("/", () =>
    Results.Ok(new { name = "AIPharm API", env = app.Environment.EnvironmentName, time = DateTime.UtcNow }))
    .WithName("Root");

app.MapHealthChecks("/health");

// DB migrate + seed on startup
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<AIPharmDbContext>();
    try
    {
        await ctx.Database.MigrateAsync();
        await DbInitializer.InitializeAsync(ctx);
        Console.WriteLine("Database migrated and initialized.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"DB init error: {ex.Message}");
        // Don't crash the app in dev.
    }
}

app.Run();

``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Web\Controllers\AssistantController.cs
`csharp
using Microsoft.AspNetCore.Mvc;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssistantController : ControllerBase
    {
        private readonly IAssistantService _assistantService;

        public AssistantController(IAssistantService assistantService)
        {
            _assistantService = assistantService;
        }

        [HttpPost("ask")]
        public async Task<ActionResult<AssistantResponseDto>> AskQuestion([FromBody] AssistantRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Question))
                {
                    return BadRequest(new { message = "Question is required" });
                }

                var response = await _assistantService.AskQuestionAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing your question", error = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<AssistantResponseDto>>> GetConversationHistory()
        {
            try
            {
                // In a real application, this would get the user ID from the JWT token
                var userId = Request.Headers["X-User-Id"].FirstOrDefault() ?? "demo-user";
                var history = await _assistantService.GetConversationHistoryAsync(userId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching conversation history", error = ex.Message });
            }
        }
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Web\Controllers\AuthController.cs
`csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IRepository<User> _userRepository;
        private readonly IConfiguration _configuration;

        public AuthController(IRepository<User> userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Simple demo authentication - in production use proper password hashing
                var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);
                
                if (user == null)
                {
                    return Ok(new { success = false, message = "РќРµРІР°Р»РёРґРµРЅ РёРјРµР№Р» РёР»Рё РїР°СЂРѕР»Р°" });
                }

                // Demo password check - in production use proper password verification
                var isValidPassword = (request.Email == "aipharmproject@gmail.com" && request.Password == "Admin123!");

                if (!isValidPassword)
                {
                    return Ok(new { success = false, message = "РќРµРІР°Р»РёРґРµРЅ РёРјРµР№Р» РёР»Рё РїР°СЂРѕР»Р°" });
                }

                // Generate JWT token
                var token = GenerateJwtToken(user);
                
                return Ok(new 
                { 
                    success = true, 
                    message = "РЈСЃРїРµС€РµРЅ РІС…РѕРґ",
                    token = token,
                    user = new 
                    {
                        id = user.Id,
                        email = user.Email,
                        fullName = user.FullName,
                        phoneNumber = user.PhoneNumber,
                        address = user.Address,
                        isAdmin = user.IsAdmin,
                        createdAt = user.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                        isDeleted = user.IsDeleted
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Р“СЂРµС€РєР° РІ СЃСЉСЂРІСЉСЂР°", error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (existingUser != null)
                {
                    return Ok(new { success = false, message = "РџРѕС‚СЂРµР±РёС‚РµР» СЃ С‚РѕР·Рё РёРјРµР№Р» РІРµС‡Рµ СЃСЉС‰РµСЃС‚РІСѓРІР°" });
                }

                // Create new user
                var user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = request.Email,
                    FullName = request.FullName,
                    PhoneNumber = request.PhoneNumber,
                    Address = request.Address,
                    IsAdmin = false,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                await _userRepository.AddAsync(user);

                return Ok(new { success = true, message = "Р РµРіРёСЃС‚СЂР°С†РёСЏС‚Р° Рµ СѓСЃРїРµС€РЅР°! РњРѕР¶РµС‚Рµ РґР° РІР»РµР·РµС‚Рµ РІ РїСЂРѕС„РёР»Р° СЃРё." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Р“СЂРµС€РєР° РІ СЃСЉСЂРІСЉСЂР°", error = ex.Message });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // In production, invalidate JWT token here
            return Ok(new { success = true, message = "РЈСЃРїРµС€РµРЅ РёР·С…РѕРґ" });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userRepository.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                {
                    return NotFound();
                }

                return Ok(new
                {
                    id = user.Id,
                    email = user.Email,
                    fullName = user.FullName,
                    phoneNumber = user.PhoneNumber,
                    address = user.Address,
                    isAdmin = user.IsAdmin,
                    createdAt = user.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    isDeleted = user.IsDeleted
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Р“СЂРµС€РєР° РІ СЃСЉСЂРІСЉСЂР°", error = ex.Message });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.FullName ?? user.Email),
                    new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
                }),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool RememberMe { get; set; } = false;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Web\Controllers\CartController.cs
`csharp
using Microsoft.AspNetCore.Mvc;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        private string GetUserId()
        {
            // In a real application, this would get the user ID from the JWT token
            // For demo purposes, we'll use a header or default to demo user
            return Request.Headers["X-User-Id"].FirstOrDefault() ?? "demo-user";
        }

        [HttpGet]
        public async Task<ActionResult<CartDto>> GetCart()
        {
            try
            {
                var userId = GetUserId();
                var cart = await _cartService.GetCartAsync(userId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the cart", error = ex.Message });
            }
        }

        [HttpPost("items")]
        public async Task<ActionResult<CartDto>> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            try
            {
                var userId = GetUserId();
                var cart = await _cartService.AddToCartAsync(userId, addToCartDto);
                return Ok(cart);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while adding to cart", error = ex.Message });
            }
        }

        [HttpPut("items/{cartItemId}")]
        public async Task<ActionResult<CartDto>> UpdateCartItem(int cartItemId, [FromBody] UpdateCartItemDto updateCartItemDto)
        {
            try
            {
                var userId = GetUserId();
                var cart = await _cartService.UpdateCartItemAsync(userId, cartItemId, updateCartItemDto);
                return Ok(cart);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating cart item", error = ex.Message });
            }
        }

        [HttpDelete("items/{cartItemId}")]
        public async Task<ActionResult<CartDto>> RemoveFromCart(int cartItemId)
        {
            try
            {
                var userId = GetUserId();
                var cart = await _cartService.RemoveFromCartAsync(userId, cartItemId);
                return Ok(cart);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while removing from cart", error = ex.Message });
            }
        }

        [HttpDelete]
        public async Task<ActionResult<CartDto>> ClearCart()
        {
            try
            {
                var userId = GetUserId();
                var cart = await _cartService.ClearCartAsync(userId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while clearing the cart", error = ex.Message });
            }
        }
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Web\Controllers\CategoriesController.cs
`csharp
using Microsoft.AspNetCore.Mvc;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            try
            {
                var categories = await _categoryService.GetCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching categories", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);
                if (category == null)
                {
                    return NotFound(new { message = $"Category with ID {id} not found" });
                }
                return Ok(category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the category", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto createCategoryDto)
        {
            try
            {
                var category = await _categoryService.CreateCategoryAsync(createCategoryDto);
                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the category", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, [FromBody] UpdateCategoryDto updateCategoryDto)
        {
            try
            {
                var category = await _categoryService.UpdateCategoryAsync(id, updateCategoryDto);
                return Ok(category);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the category", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                await _categoryService.DeleteCategoryAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the category", error = ex.Message });
            }
        }
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Web\Controllers\HealthController.cs
`csharp
using Microsoft.AspNetCore.Mvc;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow,
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
            });
        }
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Web\Controllers\ProductsController.cs
`csharp
using Microsoft.AspNetCore.Mvc;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResultDto<ProductDto>>> GetProducts([FromQuery] ProductFilterDto filter)
        {
            try
            {
                var result = await _productService.GetProductsAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching products", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);
                if (product == null)
                {
                    return NotFound(new { message = $"Product with ID {id} not found" });
                }
                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the product", error = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest(new { message = "Search term is required" });
                }

                var products = await _productService.SearchProductsAsync(searchTerm);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while searching products", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
        {
            try
            {
                var product = await _productService.CreateProductAsync(createProductDto);
                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the product", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromBody] UpdateProductDto updateProductDto)
        {
            try
            {
                var product = await _productService.UpdateProductAsync(id, updateProductDto);
                return Ok(product);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the product", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                await _productService.DeleteProductAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the product", error = ex.Message });
            }
        }
    }
}
``r

