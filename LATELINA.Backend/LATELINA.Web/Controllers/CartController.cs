using Microsoft.AspNetCore.Mvc;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        private string GetUserId()
        {
            // In a real application, this would get the user ID from the JWT token
            // For demo purposes, we'll use a header or default to demo user
            return Request.Headers["X-User-Id"].FirstOrDefault() ?? "demo-user";
        }

        [HttpGet]
        public async Task<ActionResult<CartDto>> GetCart()
        {
            try
            {
                var userId = GetUserId();
                var cart = await _cartService.GetCartAsync(userId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the cart", error = ex.Message });
            }
        }

        [HttpPost("items")]
        public async Task<ActionResult<CartDto>> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            try
            {
                var userId = GetUserId();
                var cart = await _cartService.AddToCartAsync(userId, addToCartDto);
                return Ok(cart);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while adding to cart", error = ex.Message });
            }
        }

        [HttpPut("items/{cartItemId}")]
        public async Task<ActionResult<CartDto>> UpdateCartItem(int cartItemId, [FromBody] UpdateCartItemDto updateCartItemDto)
        {
            try
            {
                var userId = GetUserId();
                var cart = await _cartService.UpdateCartItemAsync(userId, cartItemId, updateCartItemDto);
                return Ok(cart);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating cart item", error = ex.Message });
            }
        }

        [HttpDelete("items/{cartItemId}")]
        public async Task<ActionResult<CartDto>> RemoveFromCart(int cartItemId)
        {
            try
            {
                var userId = GetUserId();
                var cart = await _cartService.RemoveFromCartAsync(userId, cartItemId);
                return Ok(cart);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while removing from cart", error = ex.Message });
            }
        }

        [HttpDelete]
        public async Task<ActionResult<CartDto>> ClearCart()
        {
            try
            {
                var userId = GetUserId();
                var cart = await _cartService.ClearCartAsync(userId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while clearing the cart", error = ex.Message });
            }
        }
    }
}