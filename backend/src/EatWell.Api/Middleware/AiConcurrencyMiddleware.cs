using System.Collections.Concurrent;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace EatWell.Api.Middleware;

public sealed class AiConcurrencyMiddleware(RequestDelegate next)
{
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> Locks = new();

    private static readonly string[] AiPaths =
    [
        "/api/foods/analyze-image",
        "/api/recipes/generate",
        "/api/nutrition-goals/calculate-with-ai"
    ];

    public async Task InvokeAsync(HttpContext context)
    {
        if (!IsAiEndpoint(context.Request.Path))
        {
            await next(context);
            return;
        }

        var key = context.User.FindFirstValue("firebase_uid")
            ?? context.Connection.RemoteIpAddress?.ToString()
            ?? "unknown-client";
        var semaphore = Locks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));

        if (!semaphore.Wait(0))
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            context.Response.Headers.Append("Retry-After", "1");
            context.Response.ContentType = "application/problem+json";
            var problem = new ProblemDetails
            {
                Type = "about:blank",
                Title = "AI request already in progress.",
                Status = StatusCodes.Status429TooManyRequests,
                Detail = "Aynı kullanıcı için başka bir AI işlemi devam ediyor. Lütfen tamamlanmasını bekleyin.",
                Instance = context.Request.Path
            };
            problem.Extensions["traceId"] = context.TraceIdentifier;
            await context.Response.WriteAsJsonAsync(problem);
            return;
        }

        try
        {
            await next(context);
        }
        finally
        {
            semaphore.Release();
        }
    }

    private static bool IsAiEndpoint(PathString path) =>
        AiPaths.Any(aiPath => path.StartsWithSegments(aiPath));
}
