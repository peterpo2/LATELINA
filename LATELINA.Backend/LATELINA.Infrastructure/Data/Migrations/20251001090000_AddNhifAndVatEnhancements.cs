using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIPharm.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNhifAndVatEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_UserId",
                schema: "dbo",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "UserId",
                schema: "dbo",
                table: "Orders",
                newName: "OrderUser");

            migrationBuilder.RenameColumn(
                name: "Status",
                schema: "dbo",
                table: "Orders",
                newName: "OrderStatus");

            migrationBuilder.RenameColumn(
                name: "OrderNumber",
                schema: "dbo",
                table: "Orders",
                newName: "OrderKey");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                schema: "dbo",
                table: "Orders",
                newName: "OrderDate");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_UserId",
                schema: "dbo",
                table: "Orders",
                newName: "IX_Orders_OrderUser");

            migrationBuilder.AddColumn<decimal>(
                name: "VatRate",
                schema: "dbo",
                table: "Products",
                type: "decimal(4,2)",
                nullable: false,
                defaultValue: 0.20m);

            migrationBuilder.AddColumn<decimal>(
                name: "Subtotal",
                schema: "dbo",
                table: "Orders",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "VatAmount",
                schema: "dbo",
                table: "Orders",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "VatRate",
                schema: "dbo",
                table: "Orders",
                type: "decimal(4,2)",
                nullable: false,
                defaultValue: 0.20m);

            migrationBuilder.AddColumn<decimal>(
                name: "VatAmount",
                schema: "dbo",
                table: "OrderItems",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "VatRate",
                schema: "dbo",
                table: "OrderItems",
                type: "decimal(4,2)",
                nullable: false,
                defaultValue: 0.20m);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_OrderUser",
                schema: "dbo",
                table: "Orders",
                column: "OrderUser",
                principalSchema: "dbo",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.Sql(@"
                UPDATE o
                SET Subtotal = ROUND(o.Total / 1.2, 2),
                    VatAmount = ROUND(o.Total - ROUND(o.Total / 1.2, 2), 2),
                    VatRate = 0.20
                FROM dbo.Orders o;

                UPDATE oi
                SET VatAmount = ROUND((oi.UnitPrice * oi.Quantity) - ROUND((oi.UnitPrice * oi.Quantity) / 1.2, 2), 2),
                    VatRate = 0.20
                FROM dbo.OrderItems oi;

                UPDATE p
                SET VatRate = 0.20
                FROM dbo.Products p;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_OrderUser",
                schema: "dbo",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "NhifPrescriptions",
                schema: "dbo");

            migrationBuilder.DropColumn(
                name: "VatRate",
                schema: "dbo",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Subtotal",
                schema: "dbo",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "VatAmount",
                schema: "dbo",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "VatRate",
                schema: "dbo",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "VatAmount",
                schema: "dbo",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "VatRate",
                schema: "dbo",
                table: "OrderItems");

            migrationBuilder.RenameColumn(
                name: "OrderUser",
                schema: "dbo",
                table: "Orders",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "OrderStatus",
                schema: "dbo",
                table: "Orders",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "OrderKey",
                schema: "dbo",
                table: "Orders",
                newName: "OrderNumber");

            migrationBuilder.RenameColumn(
                name: "OrderDate",
                schema: "dbo",
                table: "Orders",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_OrderUser",
                schema: "dbo",
                table: "Orders",
                newName: "IX_Orders_UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_UserId",
                schema: "dbo",
                table: "Orders",
                column: "UserId",
                principalSchema: "dbo",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
