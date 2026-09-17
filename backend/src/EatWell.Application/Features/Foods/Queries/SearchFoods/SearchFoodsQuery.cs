using EatWell.Application.Common.Foods;
using MediatR;

namespace EatWell.Application.Features.Foods.Queries.SearchFoods;

public sealed record SearchFoodsQuery(string Query) : IRequest<IReadOnlyList<FoodSearchResultDto>>;
