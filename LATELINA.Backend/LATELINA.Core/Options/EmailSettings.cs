namespace AIPharm.Core.Options
{
    public class EmailSettings
    {
        public string FromAddress { get; set; } = "aipharmproject@gmail.com";
        public string FromName { get; set; } = "AIPharm";
        public string? OverrideToAddress { get; set; }
        public string SmtpHost { get; set; } = "smtp.gmail.com";
        public int SmtpPort { get; set; } = 587;
        public bool EnableSsl { get; set; } = true;
        public string? Username { get; set; } = "aipharmproject@gmail.com";
        public string? Password { get; set; }
        public bool UseOAuth { get; set; }
        public string OAuthScope { get; set; } = "https://mail.google.com/";
        public string? OAuthTenantId { get; set; }
        public string? OAuthClientId { get; set; }
        public string? OAuthClientSecret { get; set; }
        public string? PickupDirectory { get; set; }
        public bool UsePickupDirectory { get; set; }
        public bool CheckCertificateRevocation { get; set; } = false;
        public int CodeLength { get; set; } = 6;
        public int CodeLifetimeMinutes { get; set; } = 10;
        public int ResendCooldownSeconds { get; set; } = 60;
        public int MaxVerificationAttempts { get; set; } = 5;
    }
}
