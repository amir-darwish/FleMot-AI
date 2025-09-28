using Xunit;

namespace FleMot.Api.Tests;

// this will make sure that tests in this assembly are not run in parallel
[CollectionDefinition("Sequential", DisableParallelization = true)]
public class CollectionFixtures { }