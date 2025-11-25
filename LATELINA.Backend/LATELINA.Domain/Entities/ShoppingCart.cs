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