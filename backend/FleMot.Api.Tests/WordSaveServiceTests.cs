using Moq;
using FleMot.Api.DataAccess;
using FleMot.Api.Exceptions;
using FleMot.Api.Services;
using FleMot.Api.Models.DTOs;
using FleMot.Api.Models.Entites;
namespace FleMot.Api.Tests;

public class WordSaveServiceTests
{
    [Fact]
    public async Task SaveWordAsync_ShouldSucceed_WhenUserIsStandardAndWithinLimit()
    {
        // ARRANGE
        var mockUserRepo = new Mock<IUserRepository>();
        var fakeUser = new User{ Id = "user123", AuthId = "fakeAuthId", Role = "standard", WordCount = 5 };
        mockUserRepo.Setup(repo => repo.GetByAuthIdAsync("fakeAuthId")).ReturnsAsync(fakeUser);
        
        
        var mockPersonalWordRepo = new Mock<IPersonalWordRepository>();
        mockPersonalWordRepo.Setup(repo => repo.ExistsAsync(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(false);
        
        var service = new WordSaveService(mockUserRepo.Object, mockPersonalWordRepo.Object);
        var saveData = new SaveWordRequest("new_word", Array.Empty<ExamplePairDto>());
        
        // ACT
        await service.SaveWordAsync("fakeAuthId", saveData);
        
        // ASSERT
        mockPersonalWordRepo.Verify(repo => repo.CreateAsync(It.IsAny<PersonalWord>()), Times.Once());
        mockUserRepo.Verify(repo => repo.IncrementWordCountAsync("user123"), Times.Once());
    }

    [Fact]
    public async Task SaveWordAsync_ShouldThrowException_WhenUserIsOverLimit()
    {
        // ARRANGE
        var mockUserRepo = new Mock<IUserRepository>();
        var mockPersonalWordRepo = new Mock<IPersonalWordRepository>();

        
        var fakeUser = new User{ Id = "user123", AuthId = "fakeAuthId", Role = "standard", WordCount = 10 };
        var saveData = new SaveWordRequest("new_word", Array.Empty<ExamplePairDto>());

        
        mockUserRepo.Setup(repo => repo.GetByAuthIdAsync("fakeAuthId")).ReturnsAsync(fakeUser);
        mockPersonalWordRepo.Setup(repo => repo.ExistsAsync(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(false);

        var service = new WordSaveService(mockUserRepo.Object, mockPersonalWordRepo.Object);
        
        // ACT & ASSERT
        await Assert.ThrowsAsync<SaveLimitExceededException>(() => service.SaveWordAsync("fakeAuthId", saveData));
        mockPersonalWordRepo.Verify(repo => repo.CreateAsync(It.IsAny<PersonalWord>()), Times.Never());
    }
    
    [Fact]
    public async Task SaveWordAsync_ShouldThrowException_WhenWordIsDuplicate()
    {
        // ARRANGE
        var mockUserRepo = new Mock<IUserRepository>();
        var mockPersonalWordRepo = new Mock<IPersonalWordRepository>();

        
        var fakeUser = new User{ Id = "user123", AuthId = "fakeAuthId", Role = "standard", WordCount = 5 };
        var saveData = new SaveWordRequest("duplicate_word", Array.Empty<ExamplePairDto>());

        
        mockUserRepo.Setup(repo => repo.GetByAuthIdAsync("fakeAuthId")).ReturnsAsync(fakeUser);
        mockPersonalWordRepo.Setup(repo => repo.ExistsAsync("user123", "duplicate_word")).ReturnsAsync(true);

        var service = new WordSaveService(mockUserRepo.Object, mockPersonalWordRepo.Object);
        
        // ACT & ASSERT
        await Assert.ThrowsAsync<DuplicateWordException>(() => service.SaveWordAsync("fakeAuthId", saveData));
        mockPersonalWordRepo.Verify(repo => repo.CreateAsync(It.IsAny<PersonalWord>()), Times.Never());
    }
    
}