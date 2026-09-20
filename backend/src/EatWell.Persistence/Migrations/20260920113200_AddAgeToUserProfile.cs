using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EatWell.Persistence.Migrations;

public partial class AddAgeToUserProfile : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "Age",
            table: "UserProfiles",
            type: "integer",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Age",
            table: "UserProfiles");
    }
}
