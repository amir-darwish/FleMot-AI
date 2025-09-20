namespace FleMot.Api.Exceptions;

public class DuplicateWordException : Exception
{
    public DuplicateWordException(string word) : base($"The word '{word}' has already been saved.") { }

}