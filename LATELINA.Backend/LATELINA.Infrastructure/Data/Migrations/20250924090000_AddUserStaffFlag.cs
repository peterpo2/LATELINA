using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIPharm.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserStaffFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsStaff",
                schema: "dbo",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsStaff",
                schema: "dbo",
                table: "Users");
        }
    }
}
