using AIPharm.Core.DTOs;

namespace AIPharm.Core.Interfaces
{
    public interface IAssistantService
{
    Task<AssistantResponseDto> AskQuestionAsync(AssistantRequestDto request);
    Task<IEnumerable<AssistantResponseDto>> GetConversationHistoryAsync(string userId);
    Task SaveConversationAsync(string userId, AssistantResponseDto response);
    Task ClearConversationHistoryAsync(string userId);
}

}