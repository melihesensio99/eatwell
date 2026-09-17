using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EatWell.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MakeDailyLogUserDateUnique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DailyLogs_UserId_LogDate",
                table: "DailyLogs");

            migrationBuilder.CreateIndex(
                name: "IX_DailyLogs_UserId_LogDate",
                table: "DailyLogs",
                columns: new[] { "UserId", "LogDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DailyLogs_UserId_LogDate",
                table: "DailyLogs");

            migrationBuilder.CreateIndex(
                name: "IX_DailyLogs_UserId_LogDate",
                table: "DailyLogs",
                columns: new[] { "UserId", "LogDate" });
        }
    }
}
