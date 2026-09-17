using System.Collections.Concurrent;
using System.Security.Claims;

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
            await context.Response.WriteAsJsonAsync(new
            {
                title = "AI request already in progress.",
                status = StatusCodes.Status429TooManyRequests,
                detail = "Aynı kullanıcı için başka bir AI işlemi devam ediyor. Lütfen tamamlanmasını bekleyin."
            });
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
