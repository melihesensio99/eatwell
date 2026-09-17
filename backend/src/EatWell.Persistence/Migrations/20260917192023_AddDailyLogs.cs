using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EatWell.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DailyLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    FoodExternalId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    FoodName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Brand = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Barcode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    QuantityGrams = table.Column<decimal>(type: "numeric", nullable: false),
                    Calories = table.Column<decimal>(type: "numeric", nullable: true),
                    ProteinGrams = table.Column<decimal>(type: "numeric", nullable: true),
                    CarbohydratesGrams = table.Column<decimal>(type: "numeric", nullable: true),
                    FatGrams = table.Column<decimal>(type: "numeric", nullable: true),
                    MealType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ConsumedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DailyLogs_UserId_ConsumedAt",
                table: "DailyLogs",
                columns: new[] { "UserId", "ConsumedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyLogs");
        }
    }
}
