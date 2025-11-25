using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AIPharm.Domain.Entities
{
    public class OrderItem
    {
        public int Id { get; set; }
        
        public Guid OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal VatAmount { get; set; }

        [Column(TypeName = "decimal(4,2)")]
        public decimal VatRate { get; set; } = 0.20m;
        
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

        [NotMapped]
        public decimal NetTotal => decimal.Round(TotalPrice - VatAmount, 2, MidpointRounding.AwayFromZero);
    }
}