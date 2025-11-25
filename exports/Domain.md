### C:\AIPharm\AIPharm.Backend\AIPharm.Domain\Entities\CartItem.cs
`csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AIPharm.Domain.Entities
{
    public class CartItem
    {
        public int Id { get; set; }
        
        public int ShoppingCartId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal UnitPrice { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ShoppingCart ShoppingCart { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        
        // Calculated properties
        [NotMapped]
        public decimal TotalPrice => UnitPrice * Quantity;
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Domain\Entities\Category.cs
`csharp
using System.ComponentModel.DataAnnotations;

namespace AIPharm.Domain.Entities
{
    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Icon { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
        
        // Navigation properties
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Domain\Entities\Order.cs
`csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AIPharm.Domain.Entities
{
    public enum OrderStatus
    {
        Pending = 0,
        Confirmed = 1,
        Processing = 2,
        Shipped = 3,
        Delivered = 4,
        Cancelled = 5
    }

    public class Order
    {
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string OrderNumber { get; set; } = string.Empty;
        
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal Total { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal DeliveryFee { get; set; } = 0;
        
        [MaxLength(500)]
        public string? DeliveryAddress { get; set; }
        
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        
        [MaxLength(1000)]
        public string? Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Domain\Entities\OrderItem.cs
`csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AIPharm.Domain.Entities
{
    public class OrderItem
    {
        public int Id { get; set; }
        
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal UnitPrice { get; set; }
        
        [MaxLength(200)]
        public string ProductName { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string? ProductDescription { get; set; }
        
        // Navigation properties
        public virtual Order Order { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        
        // Calculated properties
        [NotMapped]
        public decimal TotalPrice => UnitPrice * Quantity;
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Domain\Entities\Product.cs
`csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AIPharm.Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string? NameEn { get; set; }
        
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        [MaxLength(1000)]
        public string? DescriptionEn { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }
        
        public int StockQuantity { get; set; }
        
        [MaxLength(500)]
        public string? ImageUrl { get; set; }
        
        public int CategoryId { get; set; }
        
        public bool RequiresPrescription { get; set; } = false;
        
        [MaxLength(200)]
        public string? ActiveIngredient { get; set; }
        
        [MaxLength(200)]
        public string? ActiveIngredientEn { get; set; }
        
        [MaxLength(100)]
        public string? Dosage { get; set; }
        
        [MaxLength(100)]
        public string? DosageEn { get; set; }
        
        [MaxLength(200)]
        public string? Manufacturer { get; set; }
        
        [MaxLength(200)]
        public string? ManufacturerEn { get; set; }
        
        [Column(TypeName = "decimal(3,2)")]
        public decimal? Rating { get; set; }
        
        public int ReviewCount { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
        
        // Navigation properties
        public virtual Category Category { get; set; } = null!;
        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Domain\Entities\ShoppingCart.cs
`csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AIPharm.Domain.Entities
{
    public class ShoppingCart
    {
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual ICollection<CartItem> Items { get; set; } = new List<CartItem>();
        
        // Calculated properties
        [NotMapped]
        public decimal Total => Items.Sum(item => item.TotalPrice);
        
        [NotMapped]
        public int ItemCount => Items.Sum(item => item.Quantity);
    }
}
``r

### C:\AIPharm\AIPharm.Backend\AIPharm.Domain\Entities\User.cs
`csharp
using System.ComponentModel.DataAnnotations;

namespace AIPharm.Domain.Entities
{
    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public bool IsAdmin { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
        
        // Navigation properties
        public virtual ICollection<ShoppingCart> ShoppingCarts { get; set; } = new List<ShoppingCart>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
``r

