using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssistantController : ControllerBase
    {
        private readonly IAssistantService _assistantService;

        public AssistantController(IAssistantService assistantService)
        {
            _assistantService = assistantService;
        }

        /// <summary>
        /// Ask the AI assistant a question (product-aware, safe medical advice).
        /// </summary>
        [HttpPost("ask")]
        [AllowAnonymous] // change to [Authorize] if only authenticated users can ask
        public async Task<ActionResult<AssistantResponseDto>> AskQuestion([FromBody] AssistantRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest(new { message = "❌ Question is required" });
            }

            try
            {
                var userId = GetUserId();

                // Get AI response
                var response = await _assistantService.AskQuestionAsync(request);

                // Save conversation for history
                await _assistantService.SaveConversationAsync(userId, response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "❌ An error occurred while processing your question",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get the AI conversation history for the current user.
        /// </summary>
        [HttpGet("history")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<AssistantResponseDto>>> GetConversationHistory()
        {
            try
            {
                var userId = GetUserId();
                var history = await _assistantService.GetConversationHistoryAsync(userId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "❌ An error occurred while fetching conversation history",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Clear the AI conversation history for the current user.
        /// </summary>
        [HttpDelete("history")]
        [AllowAnonymous]
        public async Task<IActionResult> ClearConversationHistory()
        {
            try
            {
                var userId = GetUserId();
                await _assistantService.ClearConversationHistoryAsync(userId);
                return Ok(new { message = "✅ Conversation history cleared" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "❌ Failed to clear history",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Helper method to extract the user ID.
        /// Priority: JWT claim "sub" > Request header "X-User-Id" > fallback "demo-user".
        /// </summary>
        private string GetUserId()
        {
            if (User?.Identity?.IsAuthenticated == true)
            {
                var userId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    return userId;
                }
            }

            return Request.Headers["X-User-Id"].FirstOrDefault() ?? "demo-user";
        }
    }
}
