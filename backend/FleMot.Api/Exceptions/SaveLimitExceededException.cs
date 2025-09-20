namespace FleMot.Api.Exceptions;

public class SaveLimitExceededException : Exception
{
    public SaveLimitExceededException() : base("Limit of 10 words reached") { }
 
}