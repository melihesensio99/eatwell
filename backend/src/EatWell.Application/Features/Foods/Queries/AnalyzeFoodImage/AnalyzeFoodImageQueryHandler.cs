using EatWell.Application.Common.Foods;
using MediatR;

namespace EatWell.Application.Features.Foods.Queries.AnalyzeFoodImage;

public sealed class AnalyzeFoodImageQueryHandler(IFoodImageAnalysisProvider provider)
    : IRequestHandler<AnalyzeFoodImageQuery, FoodImageAnalysisDto>
{
    public Task<FoodImageAnalysisDto> Handle(
        AnalyzeFoodImageQuery query,
        CancellationToken cancellationToken)
    {
        var imageDataUrl = query.ImageBase64.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase)
            ? query.ImageBase64
            : $"data:{query.MimeType};base64,{query.ImageBase64}";

        return provider.AnalyzeAsync(imageDataUrl, cancellationToken);
    }
}
