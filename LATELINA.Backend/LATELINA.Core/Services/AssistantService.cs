using System.Collections.Concurrent;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using OpenAI.Chat;

namespace AIPharm.Core.Services
{
    public class AssistantService : IAssistantService
    {
        private readonly IRepository<Product> _productRepository;
        private readonly ChatClient _chatClient;
        private static readonly ConcurrentDictionary<string, List<AssistantResponseDto>> _conversations = new();

        public AssistantService(IRepository<Product> productRepository, IConfiguration config)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));

            var apiKey = config["OpenAI:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException("❌ OpenAI API key is missing in configuration.");

            _chatClient = new ChatClient("gpt-4o-mini", apiKey);
        }

        public async Task<AssistantResponseDto> AskQuestionAsync(AssistantRequestDto request)
        {
            var response = new AssistantResponseDto
            {
                Question = request.Question,
                ProductId = request.ProductId,
                Timestamp = DateTime.UtcNow,
                Disclaimer = "⚠️ Това е обща информация. Консултирайте се с лекар."
            };

            string productContext = string.Empty;
            if (request.ProductId.HasValue)
            {
                var product = await _productRepository.FirstOrDefaultAsync(p => p.Id == request.ProductId.Value);
                if (product != null)
                {
                    productContext =
                        $"- Name: {product.Name} / {product.NameEn}\n" +
                        $"- Active ingredient: {product.ActiveIngredient}\n" +
                        $"- Dosage: {product.Dosage}\n" +
                        $"- Manufacturer: {product.Manufacturer}\n";
                }
            }

            var prompt =
                "You are an AI medical assistant for a pharmacy app. " +
                "Answer in Bulgarian if the user asked in Bulgarian, otherwise in English. " +
                "Always be concise, safe, and clear.\n\n" +
                $"User question: {request.Question}\n{productContext}\n\n" +
                "Also suggest (if relevant): dosage, side effects, alternatives.\n" +
                "Always include a disclaimer at the end.";

            try
            {
                var chatResponse = await _chatClient.CompleteChatAsync(new List<ChatMessage>
                {
                    new UserChatMessage(prompt)
                });

                var completion = chatResponse.Value;

                response.Answer = string.Join(
                    "\n",
                    completion.Content
                        .Select(c => c.Text)
                        .Where(t => !string.IsNullOrWhiteSpace(t))
                );
            }
            catch (Exception ex)
            {
                response.Answer = $"⚠️ Error: AI service unavailable. ({ex.Message})";
            }

            return response;
        }

        public async Task<IEnumerable<AssistantResponseDto>> GetConversationHistoryAsync(string userId)
        {
            await Task.CompletedTask;
            return _conversations.TryGetValue(userId, out var history)
                ? history
                : Enumerable.Empty<AssistantResponseDto>();
        }

        public async Task SaveConversationAsync(string userId, AssistantResponseDto response)
        {
            var history = _conversations.GetOrAdd(userId, _ => new List<AssistantResponseDto>());
            lock (history) history.Add(response);
            await Task.CompletedTask;
        }

        public async Task ClearConversationHistoryAsync(string userId)
        {
            _conversations.TryRemove(userId, out _);
            await Task.CompletedTask;
        }
    }
}
