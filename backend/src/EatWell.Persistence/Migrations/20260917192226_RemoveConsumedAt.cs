using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EatWell.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveConsumedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DailyLogs_UserId_ConsumedAt",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "ConsumedAt",
                table: "DailyLogs");

            migrationBuilder.CreateIndex(
                name: "IX_DailyLogs_UserId",
                table: "DailyLogs",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DailyLogs_UserId",
                table: "DailyLogs");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ConsumedAt",
                table: "DailyLogs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.CreateIndex(
                name: "IX_DailyLogs_UserId_ConsumedAt",
                table: "DailyLogs",
                columns: new[] { "UserId", "ConsumedAt" });
        }
    }
}
