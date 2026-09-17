using EatWell.Application.Common.Foods;
using MediatR;

namespace EatWell.Application.Features.Foods.Queries.AnalyzeFoodImage;

public sealed record AnalyzeFoodImageQuery(
    string ImageBase64,
    string MimeType) : IRequest<FoodImageAnalysisDto>;
