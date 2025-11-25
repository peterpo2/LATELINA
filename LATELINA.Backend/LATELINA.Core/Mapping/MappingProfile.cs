using AutoMapper;
using AIPharm.Core.DTOs;
using AIPharm.Domain.Entities;

namespace AIPharm.Core.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Product mappings
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.Ignore());
            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Category mappings
            CreateMap<Category, CategoryDto>()
                .ForMember(dest => dest.ProductCount, opt => opt.Ignore());
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Cart mappings
            CreateMap<ShoppingCart, CartDto>();
            CreateMap<CartItem, CartItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.Ignore())
                .ForMember(dest => dest.ImageUrl, opt => opt.Ignore())
                .ForMember(dest => dest.ActiveIngredient, opt => opt.Ignore());
        }
    }
}