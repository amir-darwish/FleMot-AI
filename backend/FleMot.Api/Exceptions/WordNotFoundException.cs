namespace FleMot.Api.Exceptions;

public class WordNotFoundException : Exception
{
    public WordNotFoundException(string Id) : base($"Word with Id '{Id}' not found") { }
}