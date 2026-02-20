using System.Net;
using System.Text.Json;
using API.Const;
using Application.Exceptions;

namespace API.Middlewares
{
    public class GlobalExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

        public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Validation hatası: {Message}", ex.Message);
                await WriteErrorResponse(context, HttpStatusCode.BadRequest, "Geçersiz istek", ex.Message);
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "Kayıt bulunamadı: {Message}", ex.Message);
                await WriteErrorResponse(context, HttpStatusCode.NotFound, "Kayıt bulunamadı", ex.Message);
            }
            catch (DuplicateEntryException ex)
            {
                _logger.LogWarning(ex, "Tekrarlanan kayıt: {Message}", ex.Message);
                await WriteErrorResponse(context, HttpStatusCode.Conflict, "Kayıt zaten mevcut", ex.Message);
            }
            catch (ExternalServiceException ex)
            {
                _logger.LogError(ex, "Dış servis hatası: {Message}", ex.Message);
                await WriteErrorResponse(context, HttpStatusCode.BadGateway, "Dış servis hatası", ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Yetkisiz erişim: {Message}", ex.Message);
                await WriteErrorResponse(context, HttpStatusCode.Unauthorized, "Yetkisiz erişim", ex.Message);
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogWarning(ex, "İstek zaman aşımına uğradı");
                await WriteErrorResponse(context, HttpStatusCode.GatewayTimeout, "Zaman aşımı", ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Beklenmeyen hata: {Message}", ex.Message);
                await WriteErrorResponse(context, HttpStatusCode.InternalServerError, "Sunucu hatası",
                    context.RequestServices.GetService<IWebHostEnvironment>()?.IsDevelopment() == true
                        ? ex.ToString()
                        : "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
            }
        }

        private static async Task WriteErrorResponse(HttpContext context, HttpStatusCode statusCode, string title, string detail)
        {
            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json; charset=utf-8";

            var errorResponse = new ErrorResponse
            {
                StatusCode = (int)statusCode,
                Title = title,
                Detail = detail,
                Timestamp = DateTime.UtcNow,
                Path = context.Request.Path,
            };

            var json = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false,
            });

            await context.Response.WriteAsync(json);
        }
    }
}
