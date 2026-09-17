using EatWell.Application.Common.Foods;
using MediatR;

namespace EatWell.Application.Features.Foods.Queries.SearchFoods;

public sealed class SearchFoodsQueryHandler(IFoodProvider foodProvider)
    : IRequestHandler<SearchFoodsQuery, IReadOnlyList<FoodSearchResultDto>>
{
    public Task<IReadOnlyList<FoodSearchResultDto>> Handle(
        SearchFoodsQuery request,
        CancellationToken cancellationToken)
    {
        return foodProvider.SearchAsync(request.Query, cancellationToken);
    }
}
