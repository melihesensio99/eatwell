using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EatWell.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddWaterConsumed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "WaterConsumedMilliliters",
                table: "DailyLogs",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WaterConsumedMilliliters",
                table: "DailyLogs");
        }
    }
}
