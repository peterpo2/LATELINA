using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace AIPharm.Domain.Entities
{
    public class AssistantMessage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public bool IsUser { get; set; }

        public int? ProductId { get; set; }

        [ForeignKey(nameof(ProductId))]
        public Product? Product { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
