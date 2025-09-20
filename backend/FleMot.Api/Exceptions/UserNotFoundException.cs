namespace FleMot.Api.Exceptions;

public class UserNotFoundException : Exception
{
    public UserNotFoundException(string Id) : base($"User with Id '{Id}' not found") { }
}