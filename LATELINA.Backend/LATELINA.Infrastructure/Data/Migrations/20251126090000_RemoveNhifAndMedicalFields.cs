using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Latelina.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveNhifAndMedicalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NhifPrescriptions",
                schema: "dbo");

            migrationBuilder.DropColumn(
                name: "ActiveIngredient",
                schema: "dbo",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Dosage",
                schema: "dbo",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "RequiresPrescription",
                schema: "dbo",
                table: "Products");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActiveIngredient",
                schema: "dbo",
                table: "Products",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Dosage",
                schema: "dbo",
                table: "Products",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresPrescription",
                schema: "dbo",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "NhifPrescriptions",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PrescriptionNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PersonalIdentificationNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PrescribedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PurchaseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PatientPaidAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    NhifPaidAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    OtherCoverageAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NhifPrescriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NhifPrescriptions_Orders_OrderId",
                        column: x => x.OrderId,
                        principalSchema: "dbo",
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NhifPrescriptions_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NhifPrescriptions_OrderId",
                schema: "dbo",
                table: "NhifPrescriptions",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_NhifPrescriptions_PrescriptionNumber",
                schema: "dbo",
                table: "NhifPrescriptions",
                column: "PrescriptionNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NhifPrescriptions_UserId",
                schema: "dbo",
                table: "NhifPrescriptions",
                column: "UserId");
        }
    }
}
