using MediatR;

namespace EatWell.Application.Features.DailyLogs.Commands.UpdateDailyLogItem;

public sealed record UpdateDailyLogItemCommand(
    Guid ItemId,
    decimal QuantityGrams,
    decimal? CaloriesPer100Grams,
    decimal? ProteinPer100Grams,
    decimal? CarbohydratesPer100Grams,
    decimal? FatPer100Grams) : IRequest;
