using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EatWell.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNutritionGoalPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActivityLevel",
                table: "NutritionGoals",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoalType",
                table: "NutritionGoals",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TargetWeightKg",
                table: "NutritionGoals",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActivityLevel",
                table: "NutritionGoals");

            migrationBuilder.DropColumn(
                name: "GoalType",
                table: "NutritionGoals");

            migrationBuilder.DropColumn(
                name: "TargetWeightKg",
                table: "NutritionGoals");
        }
    }
}
