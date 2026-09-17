namespace EatWell.Application.Common.Exceptions;

public sealed class ExternalServiceException(string provider, Exception innerException)
    : Exception($"{provider} servisine şu anda ulaşılamıyor.", innerException)
{
    public string Provider { get; } = provider;
}
