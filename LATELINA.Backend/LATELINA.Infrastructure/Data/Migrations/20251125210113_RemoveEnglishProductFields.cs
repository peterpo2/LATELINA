using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Latelina.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveEnglishProductFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DescriptionEn",
                schema: "dbo",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ManufacturerEn",
                schema: "dbo",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "NameEn",
                schema: "dbo",
                table: "Products");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DescriptionEn",
                schema: "dbo",
                table: "Products",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ManufacturerEn",
                schema: "dbo",
                table: "Products",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameEn",
                schema: "dbo",
                table: "Products",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }
    }
}
