namespace Application.Exceptions
{
    public class DuplicateEntryException : Exception
    {
        public DuplicateEntryException(string message) : base(message) { }
        public DuplicateEntryException(string entity, object key)
            : base($"'{entity}' ({key}) zaten mevcut") { }
    }
}
