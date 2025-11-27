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
            migrationBuilder.Sql(
                """
                IF OBJECT_ID('dbo.NhifPrescriptions', 'U') IS NOT NULL
                BEGIN
                    DROP TABLE dbo.NhifPrescriptions;
                END;

                IF EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE Name IN ('ActiveIngredient', 'Dosage', 'RequiresPrescription')
                      AND Object_ID = Object_ID('dbo.Products')
                )
                BEGIN
                    IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = 'ActiveIngredient' AND Object_ID = Object_ID('dbo.Products'))
                        ALTER TABLE dbo.Products DROP COLUMN ActiveIngredient;

                    IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = 'Dosage' AND Object_ID = Object_ID('dbo.Products'))
                        ALTER TABLE dbo.Products DROP COLUMN Dosage;

                    IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = 'RequiresPrescription' AND Object_ID = Object_ID('dbo.Products'))
                        ALTER TABLE dbo.Products DROP COLUMN RequiresPrescription;
                END;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
