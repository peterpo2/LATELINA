using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIPharm.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailTwoFactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TwoFactorEmailCodeAttempts",
                schema: "dbo",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "TwoFactorEmailCodeExpiry",
                schema: "dbo",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TwoFactorEmailCodeHash",
                schema: "dbo",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TwoFactorEnabled",
                schema: "dbo",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TwoFactorLastSentAt",
                schema: "dbo",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TwoFactorLoginToken",
                schema: "dbo",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TwoFactorLoginTokenExpiry",
                schema: "dbo",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                schema: "dbo",
                table: "Orders",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                schema: "dbo",
                table: "Orders",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerEmail",
                schema: "dbo",
                table: "Orders",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                schema: "dbo",
                table: "Orders",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethod",
                schema: "dbo",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                schema: "dbo",
                table: "Orders",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TwoFactorEmailCodeAttempts",
                schema: "dbo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TwoFactorEmailCodeExpiry",
                schema: "dbo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TwoFactorEmailCodeHash",
                schema: "dbo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TwoFactorEnabled",
                schema: "dbo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TwoFactorLastSentAt",
                schema: "dbo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TwoFactorLoginToken",
                schema: "dbo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TwoFactorLoginTokenExpiry",
                schema: "dbo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "City",
                schema: "dbo",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Country",
                schema: "dbo",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CustomerEmail",
                schema: "dbo",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CustomerName",
                schema: "dbo",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                schema: "dbo",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                schema: "dbo",
                table: "Orders");
        }
    }
}
