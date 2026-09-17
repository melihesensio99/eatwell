using MediatR;

namespace EatWell.Application.Features.Foods.Commands.AddFavoriteFood;

public sealed record AddFavoriteFoodCommand(
    string FoodExternalId,
    string FoodName,
    string? Brand,
    string? Barcode,
    decimal? CaloriesPer100Grams,
    decimal? ProteinPer100Grams,
    decimal? CarbohydratesPer100Grams,
    decimal? FatPer100Grams,
    string? ImageUrl) : IRequest;
