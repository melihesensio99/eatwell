using FluentValidation;
using EatWell.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EatWell.Api.Errors;

public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title, detail) = exception switch
        {
            ValidationException validationException => (
                StatusCodes.Status400BadRequest,
                "Validation failed.",
                (object?)validationException.Errors
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
        httpContext.Response.ContentType = "application/problem+json";

        if (detail is Dictionary<string, string[]> validationErrors)
        {
            var validationProblem = new ValidationProblemDetails(validationErrors)
            {
                Type = "about:blank",
                Title = title,
                Status = statusCode,
                Instance = httpContext.Request.Path
            };
            validationProblem.Extensions["traceId"] = httpContext.TraceIdentifier;
            await httpContext.Response.WriteAsJsonAsync(validationProblem, cancellationToken);
            return true;
        }

        var problem = new ProblemDetails
        {
            Type = "about:blank",
            Title = title,
            Status = statusCode,
            Detail = detail as string,
            Instance = httpContext.Request.Path
        };
        problem.Extensions["traceId"] = httpContext.TraceIdentifier;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);

        return true;
    }
}
