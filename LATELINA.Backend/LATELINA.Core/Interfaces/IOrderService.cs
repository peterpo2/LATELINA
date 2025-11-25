using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AIPharm.Core.DTOs;
using AIPharm.Domain.Entities;

namespace AIPharm.Core.Interfaces
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(string userId, CreateOrderDto orderDto);
        Task<IEnumerable<OrderDto>> GetOrdersForUserAsync(string userId);
        Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
        Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, OrderStatus status);
    }
}
