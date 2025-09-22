using FleMot.Api.DataAccess;
using FleMot.Api.Exceptions;
using FleMot.Api.Models.Entites;
using FleMot.Api.Services;
using Moq;

namespace FleMot.Api.Tests;

public class WordListServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPersonalWordRepository> _personalWordRepositoryMock;
    private readonly WordListService _wordListService;
    
    public WordListServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _personalWordRepositoryMock = new Mock<IPersonalWordRepository>();
        _wordListService = new WordListService( _personalWordRepositoryMock.Object ,_userRepositoryMock.Object);
    }

    [Fact]
    public async Task GetUserWordListAsync_ShouldReturnUserWords_WhenUserExists()
    {
        // Arrange
        var fakeUser = new User {Id="UserID123", AuthId="AuthID123"};
        var fakeWords = new List<PersonalWord> { new PersonalWord { Word = "test" } };
        
        _userRepositoryMock.Setup(repo => repo.GetByAuthIdAsync("AuthID123")).ReturnsAsync(fakeUser);
        _personalWordRepositoryMock.Setup(repo => repo.GetByUserIdAsync("UserID123")).ReturnsAsync(fakeWords);
        
        // Act
        var result = await _wordListService.GetUserWordListAsync("AuthID123");
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal(fakeWords.Count, result.Count);
    }
    
    [Fact]
    public async Task GetUserWordListAsync_ShouldThrowException_WhenUserDoesNotExist()
    {
        // Arrange
        _userRepositoryMock.Setup(repo => repo.GetByAuthIdAsync("NonExistentAuthID")).ReturnsAsync((User?)null);
        
        // Act & Assert
        await Assert.ThrowsAsync<UserNotFoundException>(() => _wordListService.GetUserWordListAsync("NonExistentAuthID"));
    }

    [Fact]
    public async Task DeleteWordAsync_ShouldThrowException_WhenUserDoesNotOwnWord()
    {
        // Arrange
        var fakeUser = new User {Id="UserID123", AuthId="AuthID123"};
        var wordToDelete = new PersonalWord { Id = "WordID123", UserId = "DifferentUserID" };
        
        _userRepositoryMock.Setup(repo => repo.GetByAuthIdAsync("AuthID123")).ReturnsAsync(fakeUser);
        _personalWordRepositoryMock.Setup(repo => repo.GetByIdAsync("WordID123")).ReturnsAsync(wordToDelete);
        
        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _wordListService.DeleteWordAsync("AuthID123", "WordID123"));
        _personalWordRepositoryMock.Verify(repo => repo.DeleteAsync(It.IsAny<string>()), Times.Never());
    }
}