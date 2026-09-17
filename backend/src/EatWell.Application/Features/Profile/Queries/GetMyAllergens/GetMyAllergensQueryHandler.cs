using EatWell.Application.Common.Authentication;
using EatWell.Application.Common.Persistence;
using MediatR;

namespace EatWell.Application.Features.Profile.Queries.GetMyAllergens;

public sealed class GetMyAllergensQueryHandler(
    IUserAllergenRepository userAllergenRepository,
    ICurrentUser currentUser) : IRequestHandler<GetMyAllergensQuery, IReadOnlyList<string>>
{
    public Task<IReadOnlyList<string>> Handle(
        GetMyAllergensQuery query,
        CancellationToken cancellationToken)
    {
        return userAllergenRepository.GetTagsByUserIdAsync(
            currentUser.UserId, cancellationToken);
    }
}
