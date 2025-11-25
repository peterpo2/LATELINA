using System;
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

        [Required]
        public string PasswordHash { get; set; } = string.Empty;  // ✅ new field

        public bool IsAdmin { get; set; } = false;
        public bool IsStaff { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;

        public bool TwoFactorEnabled { get; set; } = true;
        public string? TwoFactorEmailCodeHash { get; set; }
        public DateTime? TwoFactorEmailCodeExpiry { get; set; }
        public int TwoFactorEmailCodeAttempts { get; set; }
        public DateTime? TwoFactorLastSentAt { get; set; }
        public string? TwoFactorLoginToken { get; set; }
        public DateTime? TwoFactorLoginTokenExpiry { get; set; }

        // Navigation properties
        public virtual ICollection<ShoppingCart> ShoppingCarts { get; set; } = new List<ShoppingCart>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<NhifPrescription> NhifPrescriptions { get; set; } = new List<NhifPrescription>();
    }
}
