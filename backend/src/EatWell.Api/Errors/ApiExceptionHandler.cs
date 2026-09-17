using FluentValidation;
using EatWell.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;

namespace EatWell.Api.Errors;

public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title, errors) = exception switch
        {
            ValidationException validationException => (
                StatusCodes.Status400BadRequest,
                "Validation failed.",
                validationException.Errors
                    .GroupBy(error => error.PropertyName)
                    .ToDictionary(group => group.Key, group => group.Select(error => error.ErrorMessage).ToArray())),
            KeyNotFoundException => (
                StatusCodes.Status404NotFound,
                exception.Message,
                (object?)null),
            InvalidOperationException => (
                StatusCodes.Status400BadRequest,
                exception.Message,
                (object?)null),
            ExternalServiceException => (
                StatusCodes.Status502BadGateway,
                exception.Message,
                (object?)null),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Beklenmeyen bir hata oluştu.",
                (object?)null)
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
            logger.LogError(exception, "Unhandled exception.");

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(new
        {
            title,
            status = statusCode,
            errors
        }, cancellationToken);

        return true;
    }
}
