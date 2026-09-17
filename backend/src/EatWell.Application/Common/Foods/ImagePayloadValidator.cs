namespace EatWell.Application.Common.Foods;

public static class ImagePayloadValidator
{
    public const int MaxDecodedBytes = 5 * 1024 * 1024;

    public static bool TryDecode(
        string? base64,
        string? mimeType,
        out byte[] bytes,
        out string error)
    {
        bytes = [];
        error = string.Empty;

        if (string.IsNullOrWhiteSpace(base64))
        {
            error = "Görsel zorunludur.";
            return false;
        }

        if (!IsAllowedMimeType(mimeType))
        {
            error = "Sadece JPEG, PNG veya WEBP görseller desteklenir.";
            return false;
        }

        try
        {
            bytes = Convert.FromBase64String(base64);
        }
        catch (FormatException)
        {
            error = "Görsel geçerli bir base64 verisi değil.";
            return false;
        }

        if (bytes.Length == 0 || bytes.Length > MaxDecodedBytes)
        {
            error = "Görsel boyutu en fazla 5 MB olabilir.";
            return false;
        }

        if (!MatchesMimeType(bytes, mimeType!))
        {
            error = "Görsel içeriği gönderilen MIME türüyle eşleşmiyor.";
            return false;
        }

        return true;
    }

    public static bool IsAllowedMimeType(string? mimeType) =>
        mimeType is "image/jpeg" or "image/png" or "image/webp";

    private static bool MatchesMimeType(byte[] bytes, string mimeType)
    {
        return mimeType switch
        {
            "image/jpeg" => bytes.Length >= 3 &&
                            bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF,
            "image/png" => bytes.Length >= 8 &&
                           bytes.AsSpan(0, 8).SequenceEqual(
                               new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }),
            "image/webp" => bytes.Length >= 12 &&
                            bytes.AsSpan(0, 4).SequenceEqual("RIFF"u8) &&
                            bytes.AsSpan(8, 4).SequenceEqual("WEBP"u8),
            _ => false
        };
    }
}
