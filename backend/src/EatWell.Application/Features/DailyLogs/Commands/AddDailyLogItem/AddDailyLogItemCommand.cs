using MediatR;

namespace EatWell.Application.Features.DailyLogs.Commands.AddDailyLogItem;

public sealed record AddDailyLogItemCommand(
    string FoodExternalId,
    string FoodName,
    decimal QuantityGrams,
    string MealType,
    DateOnly LogDate,
    decimal? CaloriesPer100Grams,
    decimal? ProteinPer100Grams,
    decimal? CarbohydratesPer100Grams,
    decimal? FatPer100Grams,
    string? Brand,
    string? Barcode) : IRequest<Guid>;
