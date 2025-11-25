using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(new { success = false, message = "User context missing." });
            }

            var orders = await _orderService.GetOrdersForUserAsync(userId);
            return Ok(new { success = true, orders });
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(new { success = true, orders });
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .Where(error => !string.IsNullOrWhiteSpace(error))
                });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(new { success = false, message = "User context missing." });
            }

            try
            {
                var order = await _orderService.CreateOrderAsync(userId, request);
                return Ok(new
                {
                    success = true,
                    message = "Order created successfully.",
                    order
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to create order.",
                    error = ex.Message
                });
            }
        }

        [HttpPatch("{orderId:guid}/status")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateOrderStatus(Guid orderId, [FromBody] UpdateOrderStatusDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .Where(error => !string.IsNullOrWhiteSpace(error))
                });
            }

            try
            {
                var order = await _orderService.UpdateOrderStatusAsync(orderId, request.Status);
                return Ok(new
                {
                    success = true,
                    message = "Order status updated successfully.",
                    order
                });
            }
            catch (ArgumentOutOfRangeException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to update order status.",
                    error = ex.Message
                });
            }
        }
    }
}
