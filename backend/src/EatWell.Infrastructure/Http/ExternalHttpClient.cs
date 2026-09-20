using System.Text.Json;
using System.Text.Json.Serialization;
using EatWell.Application.Common.Exceptions;

namespace EatWell.Infrastructure.Http;

public static class ExternalHttpClient
{
    private const int MaxStructuredContentLength = 200_000;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public static async Task<HttpResponseMessage> SendAsync(
        HttpClient client,
        HttpRequestMessage request,
        string provider,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await client.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken);

            if (response.IsSuccessStatusCode)
                return response;

            var statusCode = (int)response.StatusCode;
            response.Dispose();
            var reason = statusCode is 401 or 403
                ? "Mistral API anahtarı geçersiz, süresi dolmuş veya bu modele erişim yetkisi yok."
                : $"External service returned HTTP {statusCode}.";
            throw new ExternalServiceException(
                provider,
                new HttpRequestException(reason));
        }
        catch (ExternalServiceException)
        {
            throw;
        }
        catch (HttpRequestException exception)
        {
            throw new ExternalServiceException(provider, exception);
        }
        catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            throw new ExternalServiceException(provider, exception);
        }
    }

    public static async Task<T?> ReadJsonAsync<T>(
        HttpResponseMessage response,
        string provider,
        CancellationToken cancellationToken)
    {
        try
        {
            var raw = await response.Content.ReadAsStringAsync(cancellationToken);
            if (raw.Length > 1_000_000)
                throw new ExternalServiceException(
                    provider,
                    new InvalidOperationException("External service response was too large."));

            return JsonSerializer.Deserialize<T>(raw, JsonOptions);
        }
        catch (ExternalServiceException)
        {
            throw;
        }
        catch (JsonException exception)
        {
            throw new ExternalServiceException(
                provider,
                new InvalidOperationException("External service JSON response could not be parsed.", exception));
        }
        catch (NotSupportedException exception)
        {
            throw new ExternalServiceException(
                provider,
                new InvalidOperationException("External service JSON response contained unsupported data.", exception));
        }
    }

    public static async Task<T> ReadStructuredChatResponseAsync<T>(
        HttpResponseMessage response,
        string provider,
        CancellationToken cancellationToken)
    {
        var completion = await ReadJsonAsync<ChatCompletionResponse>(
            response, provider, cancellationToken);
        var content = completion?.Choices?.FirstOrDefault()?.Message?.Content;

        if (string.IsNullOrWhiteSpace(content))
            throw InvalidStructuredResponse(provider, "Structured response content was empty.");

        if (content.Length > MaxStructuredContentLength)
            throw InvalidStructuredResponse(provider, "Structured response was too large.");

        if (content.Contains("```", StringComparison.Ordinal))
            throw InvalidStructuredResponse(provider, "Structured response contained markdown.");

        try
        {
            var result = JsonSerializer.Deserialize<T>(content, JsonOptions);
            return result ?? throw InvalidStructuredResponse(
                provider, "Structured response deserialized to null.");
        }
        catch (ExternalServiceException)
        {
            throw;
        }
        catch (JsonException exception)
        {
            throw InvalidStructuredResponse(provider, "Structured response JSON was invalid.", exception);
        }
        catch (NotSupportedException exception)
        {
            throw InvalidStructuredResponse(provider, "Structured response contained unsupported data.", exception);
        }
    }

    private static ExternalServiceException InvalidStructuredResponse(
        string provider,
        string message,
        Exception? innerException = null) =>
        new(provider, new InvalidOperationException(message, innerException));

    private sealed class ChatCompletionResponse
    {
        [JsonPropertyName("choices")] public List<Choice>? Choices { get; init; }
    }

    private sealed class Choice
    {
        [JsonPropertyName("message")] public Message? Message { get; init; }
    }

    private sealed class Message
    {
        [JsonPropertyName("content")] public string? Content { get; init; }
    }
}
