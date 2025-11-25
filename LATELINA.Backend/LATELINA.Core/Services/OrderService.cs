using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AIPharm.Core.Services
{
    public class OrderService : IOrderService
    {
        private const decimal FreeDeliveryThreshold = 25m;
        private const decimal StandardDeliveryFee = 4.99m;
        private const decimal DefaultVatRate = 0.20m;

        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<User> _userRepository;

        public OrderService(
            IRepository<Order> orderRepository,
            IRepository<Product> productRepository,
            IRepository<User> userRepository)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _userRepository = userRepository;
        }

        public async Task<OrderDto> CreateOrderAsync(string userId, CreateOrderDto orderDto)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(userId);
            ArgumentNullException.ThrowIfNull(orderDto);

            if (orderDto.Items == null || orderDto.Items.Count == 0)
            {
                throw new InvalidOperationException("Cannot create an order without any items.");
            }

            var user = await _userRepository.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found.", nameof(userId));

            var orderItems = new List<OrderItem>();
            decimal netTotal = 0m;
            decimal vatTotal = 0m;

            var requiresPrescription = false;

            foreach (var item in orderDto.Items)
            {
                if (item.Quantity <= 0)
                {
                    throw new ArgumentException("Item quantity must be at least 1.");
                }

                var product = await _productRepository.GetByIdAsync(item.ProductId)
                              ?? throw new ArgumentException($"Product with ID {item.ProductId} was not found.");

                if (product.RequiresPrescription)
                {
                    requiresPrescription = true;
                }

                var vatRate = product.VatRate > 0 ? product.VatRate : DefaultVatRate;
                var unitPrice = product.Price;

                var lineGross = decimal.Round(unitPrice * item.Quantity, 2, MidpointRounding.AwayFromZero);
                var netUnitPrice = decimal.Round(unitPrice / (1 + vatRate), 4, MidpointRounding.AwayFromZero);
                var lineNet = decimal.Round(netUnitPrice * item.Quantity, 2, MidpointRounding.AwayFromZero);
                var lineVat = decimal.Round(lineGross - lineNet, 2, MidpointRounding.AwayFromZero);

                netTotal += lineNet;
                vatTotal += lineVat;
                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice,
                    VatRate = vatRate,
                    VatAmount = lineVat,
                    ProductName = product.Name,
                    ProductDescription = product.Description,
                });
            }

            var subtotal = decimal.Round(netTotal, 2, MidpointRounding.AwayFromZero);
            var vatAmount = decimal.Round(vatTotal, 2, MidpointRounding.AwayFromZero);
            var totalWithVat = decimal.Round(subtotal + vatAmount, 2, MidpointRounding.AwayFromZero);

            var deliveryFee = totalWithVat >= FreeDeliveryThreshold ? 0m : StandardDeliveryFee;

            var distinctVatRates = orderItems.Select(oi => oi.VatRate).Distinct().ToList();
            var aggregatedVatRate = distinctVatRates.Count == 1 ? distinctVatRates[0] : DefaultVatRate;

            if (requiresPrescription && (orderDto.NhifPrescriptions == null || orderDto.NhifPrescriptions.Count == 0))
            {
                throw new InvalidOperationException("Prescription details are required for prescription-only items.");
            }

            var order = new Order
            {
                UserId = userId,
                User = user,
                OrderNumber = GenerateOrderNumber(),
                Status = OrderStatus.Pending,
                PaymentMethod = orderDto.PaymentMethod,
                Total = totalWithVat,
                Subtotal = subtotal,
                VatAmount = vatAmount,
                VatRate = aggregatedVatRate,
                DeliveryFee = deliveryFee,
                DeliveryAddress = Normalize(orderDto.DeliveryAddress),
                City = Normalize(orderDto.City),
                PostalCode = Normalize(orderDto.PostalCode),
                Country = Normalize(orderDto.Country),
                CustomerName = Normalize(orderDto.CustomerName) ?? user.FullName,
                CustomerEmail = Normalize(orderDto.CustomerEmail) ?? user.Email,
                PhoneNumber = Normalize(orderDto.PhoneNumber) ?? user.PhoneNumber,
                Notes = Normalize(orderDto.Notes),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Items = orderItems
            };

            if (orderDto.NhifPrescriptions != null && orderDto.NhifPrescriptions.Count > 0)
            {
                foreach (var prescriptionDto in orderDto.NhifPrescriptions)
                {
                    if (string.IsNullOrWhiteSpace(prescriptionDto.PrescriptionNumber) ||
                        string.IsNullOrWhiteSpace(prescriptionDto.PersonalIdentificationNumber))
                    {
                        throw new ArgumentException("Prescription number and personal identification number are required for NHIF records.");
                    }

                    var prescribedDate = prescriptionDto.PrescribedDate ?? DateTime.UtcNow;
                    var purchaseDate = prescriptionDto.PurchaseDate ?? DateTime.UtcNow;

                    order.NhifPrescriptions.Add(new NhifPrescription
                    {
                        PrescriptionNumber = Normalize(prescriptionDto.PrescriptionNumber)!,
                        PersonalIdentificationNumber = Normalize(prescriptionDto.PersonalIdentificationNumber)!,
                        PrescribedDate = DateTime.SpecifyKind(prescribedDate, DateTimeKind.Utc),
                        PurchaseDate = DateTime.SpecifyKind(purchaseDate, DateTimeKind.Utc),
                        OrderNumber = order.OrderNumber,
                        UserId = userId,
                        PatientPaidAmount = decimal.Round(prescriptionDto.PatientPaidAmount ?? totalWithVat, 2, MidpointRounding.AwayFromZero),
                        NhifPaidAmount = decimal.Round(prescriptionDto.NhifPaidAmount ?? 0m, 2, MidpointRounding.AwayFromZero),
                        OtherCoverageAmount = prescriptionDto.OtherCoverageAmount.HasValue
                            ? decimal.Round(prescriptionDto.OtherCoverageAmount.Value, 2, MidpointRounding.AwayFromZero)
                            : null,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            await _orderRepository.AddAsync(order);

            var createdOrder = await _orderRepository.Query()
                .Where(o => o.Id == order.Id)
                .Include(o => o.Items)
                .Include(o => o.NhifPrescriptions)
                .Include(o => o.User)
                .FirstAsync();

            return MapOrder(createdOrder);
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersForUserAsync(string userId)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(userId);

            var orders = await _orderRepository.Query()
                .Where(o => o.UserId == userId)
                .Include(o => o.Items)
                .Include(o => o.NhifPrescriptions)
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapOrder).ToList();
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository.Query()
                .Include(o => o.Items)
                .Include(o => o.NhifPrescriptions)
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapOrder).ToList();
        }

        public async Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, OrderStatus status)
        {
            if (orderId == Guid.Empty)
            {
                throw new ArgumentOutOfRangeException(nameof(orderId));
            }

            if (!Enum.IsDefined(typeof(OrderStatus), status))
            {
                throw new ArgumentOutOfRangeException(nameof(status));
            }

            var order = await _orderRepository.GetByIdAsync(orderId)
                        ?? throw new KeyNotFoundException($"Order with ID {orderId} was not found.");

            if (order.Status != status)
            {
                order.Status = status;
            }

            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepository.UpdateAsync(order);

            var updatedOrder = await _orderRepository.Query()
                .Where(o => o.Id == orderId)
                .Include(o => o.Items)
                .Include(o => o.NhifPrescriptions)
                .Include(o => o.User)
                .FirstOrDefaultAsync()
                ?? throw new InvalidOperationException("Failed to load the order after updating its status.");

            return MapOrder(updatedOrder);
        }

        private static string GenerateOrderNumber()
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var randomSuffix = Random.Shared.Next(1000, 9999);
            return $"ORD-{timestamp}-{randomSuffix}";
        }

        private static string? Normalize(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            return value.Trim();
        }

        private static OrderDto MapOrder(Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                Status = order.Status,
                PaymentMethod = order.PaymentMethod,
                Total = order.Total,
                Subtotal = order.Subtotal,
                VatAmount = order.VatAmount,
                VatRate = order.VatRate,
                DeliveryFee = order.DeliveryFee,
                CustomerName = order.CustomerName ?? order.User?.FullName,
                CustomerEmail = order.CustomerEmail ?? order.User?.Email,
                PhoneNumber = order.PhoneNumber ?? order.User?.PhoneNumber,
                DeliveryAddress = order.DeliveryAddress,
                City = order.City,
                PostalCode = order.PostalCode,
                Country = order.Country,
                Notes = order.Notes,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                UserId = order.UserId,
                UserEmail = order.User?.Email,
                UserFullName = order.User?.FullName,
                Items = order.Items
                    .OrderBy(i => i.Id)
                    .Select(i => new OrderItemDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        ProductDescription = i.ProductDescription,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        TotalPrice = decimal.Round(i.UnitPrice * i.Quantity, 2, MidpointRounding.AwayFromZero),
                        VatAmount = decimal.Round(i.VatAmount, 2, MidpointRounding.AwayFromZero),
                        VatRate = i.VatRate
                    })
                    .ToList(),
                NhifPrescriptions = order.NhifPrescriptions
                    .OrderBy(p => p.Id)
                    .Select(p => new NhifPrescriptionDto
                    {
                        Id = p.Id,
                        PrescriptionNumber = p.PrescriptionNumber,
                        PersonalIdentificationNumber = p.PersonalIdentificationNumber,
                        PrescribedDate = p.PrescribedDate,
                        PurchaseDate = p.PurchaseDate,
                        OrderNumber = p.OrderNumber,
                        UserId = p.UserId,
                        PatientPaidAmount = p.PatientPaidAmount,
                        NhifPaidAmount = p.NhifPaidAmount,
                        OtherCoverageAmount = p.OtherCoverageAmount,
                        CreatedAt = p.CreatedAt
                    })
                    .ToList()
            };
        }
    }
}
