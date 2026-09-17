using EatWell.Application.Common.Foods;
using MediatR;

namespace EatWell.Application.Features.Foods.Queries.GetFoodByBarcode;

public sealed record GetFoodByBarcodeQuery(string Barcode) : IRequest<FoodDetailsDto?>;
