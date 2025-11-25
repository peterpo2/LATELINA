namespace AIPharm.Core.DTOs
{
    public class AssistantRequestDto
    {
        public string Question { get; set; } = string.Empty;
        public int? ProductId { get; set; }
    }

    public class AssistantResponseDto
    {
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public int? ProductId { get; set; }
        public DateTime Timestamp { get; set; }
        public string Disclaimer { get; set; } = "⚠️ Това е обща информация. Консултирайте се с лекар.";
    }
}