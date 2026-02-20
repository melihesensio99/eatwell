namespace Application.Exceptions
{
    public class ExternalServiceException : Exception
    {
        public ExternalServiceException(string message) : base(message) { }
        public ExternalServiceException(string serviceName, string detail)
            : base($"'{serviceName}' servisi ile iletişim kurulamadı: {detail}") { }
    }
}
