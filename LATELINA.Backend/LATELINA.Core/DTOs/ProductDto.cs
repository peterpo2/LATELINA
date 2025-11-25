using System.ComponentModel.DataAnnotations;

namespace AIPharm.Core.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        [Required]
        [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters.")]
        public string Name { get; set; } = string.Empty;
        [StringLength(200, ErrorMessage = "NameEn cannot exceed 200 characters.")]
        public string? NameEn { get; set; }
        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string? Description { get; set; }
        [StringLength(1000, ErrorMessage = "DescriptionEn cannot exceed 1000 characters.")]
        public string? DescriptionEn { get; set; }
        [Range(typeof(decimal), "0.01", "99999999.99", ErrorMessage = "Price must be between 0.01 and 99999999.99.")]
        public decimal Price { get; set; }
        [Range(0, 1000000, ErrorMessage = "Stock quantity must be between 0 and 1,000,000.")]
        public int StockQuantity { get; set; }
        [StringLength(500, ErrorMessage = "ImageUrl cannot exceed 500 characters.")]
        public string? ImageUrl { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "CategoryId must be a positive integer.")]
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public bool RequiresPrescription { get; set; }
        [StringLength(200, ErrorMessage = "ActiveIngredient cannot exceed 200 characters.")]
        public string? ActiveIngredient { get; set; }
        [StringLength(200, ErrorMessage = "ActiveIngredientEn cannot exceed 200 characters.")]
        public string? ActiveIngredientEn { get; set; }
        [StringLength(100, ErrorMessage = "Dosage cannot exceed 100 characters.")]
        public string? Dosage { get; set; }
        [StringLength(100, ErrorMessage = "DosageEn cannot exceed 100 characters.")]
        public string? DosageEn { get; set; }
        [StringLength(200, ErrorMessage = "Manufacturer cannot exceed 200 characters.")]
        public string? Manufacturer { get; set; }
        [StringLength(200, ErrorMessage = "ManufacturerEn cannot exceed 200 characters.")]
        public string? ManufacturerEn { get; set; }
        [Range(typeof(decimal), "0", "5", ErrorMessage = "Rating must be between 0 and 5.")]
        public decimal? Rating { get; set; }
        public int ReviewCount { get; set; }
    }

    public class CreateProductDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters.")]
        public string Name { get; set; } = string.Empty;
        [StringLength(200, ErrorMessage = "NameEn cannot exceed 200 characters.")]
        public string? NameEn { get; set; }
        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string? Description { get; set; }
        [StringLength(1000, ErrorMessage = "DescriptionEn cannot exceed 1000 characters.")]
        public string? DescriptionEn { get; set; }
        [Range(typeof(decimal), "0.01", "99999999.99", ErrorMessage = "Price must be between 0.01 and 99999999.99.")]
        public decimal Price { get; set; }
        [Range(0, 1000000, ErrorMessage = "Stock quantity must be between 0 and 1,000,000.")]
        public int StockQuantity { get; set; }
        [StringLength(500, ErrorMessage = "ImageUrl cannot exceed 500 characters.")]
        public string? ImageUrl { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "CategoryId must be a positive integer.")]
        public int CategoryId { get; set; }
        public bool RequiresPrescription { get; set; }
        [StringLength(200, ErrorMessage = "ActiveIngredient cannot exceed 200 characters.")]
        public string? ActiveIngredient { get; set; }
        [StringLength(200, ErrorMessage = "ActiveIngredientEn cannot exceed 200 characters.")]
        public string? ActiveIngredientEn { get; set; }
        [StringLength(100, ErrorMessage = "Dosage cannot exceed 100 characters.")]
        public string? Dosage { get; set; }
        [StringLength(100, ErrorMessage = "DosageEn cannot exceed 100 characters.")]
        public string? DosageEn { get; set; }
        [StringLength(200, ErrorMessage = "Manufacturer cannot exceed 200 characters.")]
        public string? Manufacturer { get; set; }
        [StringLength(200, ErrorMessage = "ManufacturerEn cannot exceed 200 characters.")]
        public string? ManufacturerEn { get; set; }
    }

    public class UpdateProductDto
    {
        [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters.")]
        public string? Name { get; set; }
        [StringLength(200, ErrorMessage = "NameEn cannot exceed 200 characters.")]
        public string? NameEn { get; set; }
        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string? Description { get; set; }
        [StringLength(1000, ErrorMessage = "DescriptionEn cannot exceed 1000 characters.")]
        public string? DescriptionEn { get; set; }
        [Range(typeof(decimal), "0.01", "99999999.99", ErrorMessage = "Price must be between 0.01 and 99999999.99.")]
        public decimal? Price { get; set; }
        [Range(0, 1000000, ErrorMessage = "Stock quantity must be between 0 and 1,000,000.")]
        public int? StockQuantity { get; set; }
        [StringLength(500, ErrorMessage = "ImageUrl cannot exceed 500 characters.")]
        public string? ImageUrl { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "CategoryId must be a positive integer.")]
        public int? CategoryId { get; set; }
        public bool? RequiresPrescription { get; set; }
        [StringLength(200, ErrorMessage = "ActiveIngredient cannot exceed 200 characters.")]
        public string? ActiveIngredient { get; set; }
        [StringLength(200, ErrorMessage = "ActiveIngredientEn cannot exceed 200 characters.")]
        public string? ActiveIngredientEn { get; set; }
        [StringLength(100, ErrorMessage = "Dosage cannot exceed 100 characters.")]
        public string? Dosage { get; set; }
        [StringLength(100, ErrorMessage = "DosageEn cannot exceed 100 characters.")]
        public string? DosageEn { get; set; }
        [StringLength(200, ErrorMessage = "Manufacturer cannot exceed 200 characters.")]
        public string? Manufacturer { get; set; }
        [StringLength(200, ErrorMessage = "ManufacturerEn cannot exceed 200 characters.")]
        public string? ManufacturerEn { get; set; }
    }

    public class ProductFilterDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "CategoryId must be a positive integer.")]
        public int? CategoryId { get; set; }
        [Range(typeof(decimal), "0", "99999999.99", ErrorMessage = "MinPrice must be non-negative.")]
        public decimal? MinPrice { get; set; }
        [Range(typeof(decimal), "0", "99999999.99", ErrorMessage = "MaxPrice must be non-negative.")]
        public decimal? MaxPrice { get; set; }
        [StringLength(200, ErrorMessage = "SearchTerm cannot exceed 200 characters.")]
        public string? SearchTerm { get; set; }
        public bool? RequiresPrescription { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "PageNumber must be at least 1.")]
        public int PageNumber { get; set; } = 1;
        [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
        public int PageSize { get; set; } = 20;
    }
}