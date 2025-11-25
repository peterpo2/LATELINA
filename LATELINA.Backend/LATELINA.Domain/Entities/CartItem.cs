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