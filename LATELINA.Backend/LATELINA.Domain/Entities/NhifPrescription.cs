using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AIPharm.Domain.Entities
{
    public class NhifPrescription
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string PrescriptionNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PersonalIdentificationNumber { get; set; } = string.Empty;

        public DateTime PrescribedDate { get; set; }

        public DateTime PurchaseDate { get; set; }

        [Required]
        public Guid OrderId { get; set; }

        [Required]
        [MaxLength(100)]
        public string OrderNumber { get; set; } = string.Empty;

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal PatientPaidAmount { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal NhifPaidAmount { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? OtherCoverageAmount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Order Order { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
