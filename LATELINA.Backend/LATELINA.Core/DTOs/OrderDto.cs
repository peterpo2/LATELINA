using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using AIPharm.Domain.Entities;

namespace AIPharm.Core.DTOs
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string OrderKey => OrderNumber;
        public OrderStatus Status { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public decimal Total { get; set; }
        public decimal Subtotal { get; set; }
        public decimal VatAmount { get; set; }
        public decimal VatRate { get; set; }
        public decimal DeliveryFee { get; set; }
        public decimal GrandTotal => Total + DeliveryFee;
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? PhoneNumber { get; set; }
        public string? DeliveryAddress { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime OrderDate => CreatedAt;
        public DateTime UpdatedAt { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? UserEmail { get; set; }
        public string? UserFullName { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
        public List<NhifPrescriptionDto> NhifPrescriptions { get; set; } = new();
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductDescription { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal VatAmount { get; set; }
        public decimal VatRate { get; set; }
        public decimal NetTotal => decimal.Round(TotalPrice - VatAmount, 2, MidpointRounding.AwayFromZero);
    }

    public class CreateOrderItemDto
    {
        [Range(1, int.MaxValue)]
        public int ProductId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class CreateOrderDto
    {
        [Required]
        [MinLength(1)]
        public List<CreateOrderItemDto> Items { get; set; } = new();

        [MaxLength(150)]
        public string? CustomerName { get; set; }

        [EmailAddress]
        [MaxLength(100)]
        public string? CustomerEmail { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(500)]
        public string? DeliveryAddress { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        public List<CreateNhifPrescriptionDto>? NhifPrescriptions { get; set; }
    }

    public class NhifPrescriptionDto
    {
        public int Id { get; set; }
        public string PrescriptionNumber { get; set; } = string.Empty;
        public string PersonalIdentificationNumber { get; set; } = string.Empty;
        public DateTime PrescribedDate { get; set; }
        public DateTime PurchaseDate { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public decimal PatientPaidAmount { get; set; }
        public decimal NhifPaidAmount { get; set; }
        public decimal? OtherCoverageAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateNhifPrescriptionDto
    {
        [Required]
        [MaxLength(50)]
        public string PrescriptionNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PersonalIdentificationNumber { get; set; } = string.Empty;

        public DateTime? PrescribedDate { get; set; }

        public DateTime? PurchaseDate { get; set; }

        [Range(typeof(decimal), "0", "79228162514264337593543950335")]
        public decimal? PatientPaidAmount { get; set; }

        [Range(typeof(decimal), "0", "79228162514264337593543950335")]
        public decimal? NhifPaidAmount { get; set; }

        [Range(typeof(decimal), "0", "79228162514264337593543950335")]
        public decimal? OtherCoverageAmount { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        [Required]
        public OrderStatus Status { get; set; }
    }
}
