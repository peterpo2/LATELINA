using System;
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

        [Column(TypeName = "decimal(4,2)")]
        public decimal VatRate { get; set; } = 0.20m;
        
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

        [NotMapped]
        public decimal PriceWithoutVat => decimal.Round(Price / (1 + VatRate), 2, MidpointRounding.AwayFromZero);

        [NotMapped]
        public decimal VatAmount => decimal.Round(Price - PriceWithoutVat, 2, MidpointRounding.AwayFromZero);
    }
}