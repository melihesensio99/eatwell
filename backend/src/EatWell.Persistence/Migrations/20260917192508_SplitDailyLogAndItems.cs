using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EatWell.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SplitDailyLogAndItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Barcode",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "Brand",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "Calories",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "CarbohydratesGrams",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "FatGrams",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "FoodExternalId",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "FoodName",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "MealType",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "ProteinGrams",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "QuantityGrams",
                table: "DailyLogs");

            migrationBuilder.CreateTable(
                name: "DailyLogItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DailyLogId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyLogItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyLogItems_DailyLogs_DailyLogId",
                        column: x => x.DailyLogId,
                        principalTable: "DailyLogs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DailyLogItems_DailyLogId",
                table: "DailyLogItems",
                column: "DailyLogId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyLogItems");

            migrationBuilder.AddColumn<string>(
                name: "Barcode",
                table: "DailyLogs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Brand",
                table: "DailyLogs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Calories",
                table: "DailyLogs",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CarbohydratesGrams",
                table: "DailyLogs",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FatGrams",
                table: "DailyLogs",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FoodExternalId",
                table: "DailyLogs",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FoodName",
                table: "DailyLogs",
                type: "character varying(300)",
                maxLength: 300,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MealType",
                table: "DailyLogs",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "ProteinGrams",
                table: "DailyLogs",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "QuantityGrams",
                table: "DailyLogs",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
