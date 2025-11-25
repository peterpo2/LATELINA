using AutoMapper;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;

namespace AIPharm.Core.Services
{
    public class CartService : ICartService
    {
        private readonly IRepository<ShoppingCart> _cartRepository;
        private readonly IRepository<CartItem> _cartItemRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IMapper _mapper;

        public CartService(
            IRepository<ShoppingCart> cartRepository,
            IRepository<CartItem> cartItemRepository,
            IRepository<Product> productRepository,
            IMapper mapper)
        {
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _productRepository = productRepository;
            _mapper = mapper;
        }

        public async Task<CartDto> GetCartAsync(string userId)
        {
            var cart = await _cartRepository.FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart == null)
            {
                cart = new ShoppingCart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                cart = await _cartRepository.AddAsync(cart);
            }

            var cartItems = await _cartItemRepository.FindAsync(ci => ci.ShoppingCartId == cart.Id);
            var cartDto = _mapper.Map<CartDto>(cart);
            
            foreach (var item in cartItems)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product != null)
                {
                    var cartItemDto = new CartItemDto
                    {
                        Id = item.Id,
                        ProductId = item.ProductId,
                        ProductName = product.Name,
                        ImageUrl = product.ImageUrl,
                        ActiveIngredient = product.ActiveIngredient,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.TotalPrice
                    };
                    cartDto.Items.Add(cartItemDto);
                }
            }

            cartDto.Total = cartDto.Items.Sum(i => i.TotalPrice);
            cartDto.ItemCount = cartDto.Items.Sum(i => i.Quantity);

            return cartDto;
        }

        public async Task<CartDto> AddToCartAsync(string userId, AddToCartDto addToCartDto)
        {
            var product = await _productRepository.GetByIdAsync(addToCartDto.ProductId);
            if (product == null)
                throw new ArgumentException("Product not found");

            if (product.StockQuantity < addToCartDto.Quantity)
                throw new InvalidOperationException("Insufficient stock");

            var cart = await _cartRepository.FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart == null)
            {
                cart = new ShoppingCart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                cart = await _cartRepository.AddAsync(cart);
            }

            var existingItem = await _cartItemRepository.FirstOrDefaultAsync(ci => 
                ci.ShoppingCartId == cart.Id && ci.ProductId == addToCartDto.ProductId);

            if (existingItem != null)
            {
                existingItem.Quantity += addToCartDto.Quantity;
                existingItem.UpdatedAt = DateTime.UtcNow;
                await _cartItemRepository.UpdateAsync(existingItem);
            }
            else
            {
                var cartItem = new CartItem
                {
                    ShoppingCartId = cart.Id,
                    ProductId = addToCartDto.ProductId,
                    Quantity = addToCartDto.Quantity,
                    UnitPrice = product.Price,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _cartItemRepository.AddAsync(cartItem);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _cartRepository.UpdateAsync(cart);

            return await GetCartAsync(userId);
        }

        public async Task<CartDto> UpdateCartItemAsync(string userId, int cartItemId, UpdateCartItemDto updateCartItemDto)
        {
            var cartItem = await _cartItemRepository.GetByIdAsync(cartItemId);
            if (cartItem == null)
                throw new ArgumentException("Cart item not found");

            var cart = await _cartRepository.GetByIdAsync(cartItem.ShoppingCartId);
            if (cart == null || cart.UserId != userId)
                throw new UnauthorizedAccessException("Cart item does not belong to user");

            if (updateCartItemDto.Quantity <= 0)
            {
                await _cartItemRepository.DeleteAsync(cartItem);
            }
            else
            {
                var product = await _productRepository.GetByIdAsync(cartItem.ProductId);
                if (product != null && product.StockQuantity < updateCartItemDto.Quantity)
                    throw new InvalidOperationException("Insufficient stock");

                cartItem.Quantity = updateCartItemDto.Quantity;
                cartItem.UpdatedAt = DateTime.UtcNow;
                await _cartItemRepository.UpdateAsync(cartItem);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _cartRepository.UpdateAsync(cart);

            return await GetCartAsync(userId);
        }

        public async Task<CartDto> RemoveFromCartAsync(string userId, int cartItemId)
        {
            var cartItem = await _cartItemRepository.GetByIdAsync(cartItemId);
            if (cartItem == null)
                throw new ArgumentException("Cart item not found");

            var cart = await _cartRepository.GetByIdAsync(cartItem.ShoppingCartId);
            if (cart == null || cart.UserId != userId)
                throw new UnauthorizedAccessException("Cart item does not belong to user");

            await _cartItemRepository.DeleteAsync(cartItem);

            cart.UpdatedAt = DateTime.UtcNow;
            await _cartRepository.UpdateAsync(cart);

            return await GetCartAsync(userId);
        }

        public async Task<CartDto> ClearCartAsync(string userId)
        {
            var cart = await _cartRepository.FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart != null)
            {
                var cartItems = await _cartItemRepository.FindAsync(ci => ci.ShoppingCartId == cart.Id);
                foreach (var item in cartItems)
                {
                    await _cartItemRepository.DeleteAsync(item);
                }

                cart.UpdatedAt = DateTime.UtcNow;
                await _cartRepository.UpdateAsync(cart);
            }

            return await GetCartAsync(userId);
        }
    }
}