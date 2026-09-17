using EatWell.Application.Common.Foods;
using MediatR;

namespace EatWell.Application.Features.Foods.Queries.GetSavedFoods;

public sealed record GetSavedFoodsQuery(bool RecentOnly) : IRequest<IReadOnlyList<SavedFoodDto>>;
