using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using AIPharm.Core.Exceptions;
using AIPharm.Core.Interfaces;
using AIPharm.Core.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using MimeKit;
using MimeKit.Text;

namespace AIPharm.Infrastructure.Services;

public class SmtpEmailSender : IEmailSender
{
    private const string DefaultOAuthScope = "https://mail.google.com/";

    private readonly EmailSettings _settings;
    private readonly ILogger<SmtpEmailSender> _logger;
    private readonly string? _pickupDirectory;
    private readonly bool _usePickupDirectory;
    private readonly bool _useOAuth;
    private readonly Lazy<IConfidentialClientApplication>? _confidentialClient;
    private readonly string _oauthScope;
    private readonly string? _oauthUser;

    public SmtpEmailSender(
        IOptions<EmailSettings> settings,
        ILogger<SmtpEmailSender> logger,
        IHostEnvironment hostEnvironment)
    {
        _settings = settings.Value;
        _logger = logger;

        _useOAuth = _settings.UseOAuth;
        _oauthScope = string.IsNullOrWhiteSpace(_settings.OAuthScope)
            ? DefaultOAuthScope
            : _settings.OAuthScope.Trim();

        if (_useOAuth)
        {
            _oauthUser = !string.IsNullOrWhiteSpace(_settings.Username)
                ? _settings.Username!.Trim()
                : _settings.FromAddress?.Trim();

            var tenantId = _settings.OAuthTenantId?.Trim();
            var clientId = _settings.OAuthClientId?.Trim();
            var clientSecret = _settings.OAuthClientSecret;

            if (string.IsNullOrWhiteSpace(_oauthUser))
            {
                _logger.LogWarning("SMTP OAuth is enabled but no mailbox username or from address is configured.");
            }

            if (string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            {
                _logger.LogWarning("SMTP OAuth is enabled but Azure AD application credentials are incomplete.");
            }
            else
            {
                _confidentialClient = new Lazy<IConfidentialClientApplication>(() =>
                    ConfidentialClientApplicationBuilder
                        .Create(clientId)
                        .WithClientSecret(clientSecret)
                        .WithAuthority(new Uri($"https://login.microsoftonline.com/{tenantId}/"))
                        .Build());
            }
        }
        else
        {
            _oauthUser = null;
        }

        var hasPickupPath = !string.IsNullOrWhiteSpace(_settings.PickupDirectory);
        _usePickupDirectory = _settings.UsePickupDirectory && hasPickupPath;

        if (_settings.UsePickupDirectory && !hasPickupPath)
        {
            _logger.LogWarning("Email pickup directory usage was enabled but no directory path was provided.");
        }

        _pickupDirectory = _usePickupDirectory
            ? ResolvePickupDirectory(_settings.PickupDirectory, hostEnvironment.ContentRootPath)
            : null;

        if (_usePickupDirectory && !string.IsNullOrWhiteSpace(_pickupDirectory))
        {
            _logger.LogInformation(
                "Email sender configured to write .eml files to {Directory}",
                _pickupDirectory);
        }
        else
        {
            var authMode = _useOAuth
                ? "OAuth 2.0 client credentials"
                : string.IsNullOrWhiteSpace(_settings.Username)
                    ? "no authentication"
                    : "username/password";

            _logger.LogInformation(
                "Email sender configured for SMTP delivery via {Host}:{Port} (SSL: {EnableSsl}, Auth: {AuthMode})",
                _settings.SmtpHost,
                _settings.SmtpPort,
                _settings.EnableSsl,
                authMode);
        }

        if (!string.IsNullOrWhiteSpace(_settings.OverrideToAddress))
        {
            _logger.LogInformation(
                "Email override address active. All messages will be redirected to {Override}",
                _settings.OverrideToAddress);
        }
    }

    public async Task SendEmailAsync(
        string toEmail,
        string subject,
        string plainTextBody,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
        {
            throw new ArgumentException("Recipient email is required", nameof(toEmail));
        }

        cancellationToken.ThrowIfCancellationRequested();

        var trimmedRecipient = toEmail.Trim();
        var destinationEmail = string.IsNullOrWhiteSpace(_settings.OverrideToAddress)
            ? trimmedRecipient
            : _settings.OverrideToAddress.Trim();

        if (string.IsNullOrWhiteSpace(destinationEmail))
        {
            throw new InvalidOperationException("Resolved destination email address is empty.");
        }

        if (!string.Equals(destinationEmail, trimmedRecipient, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation(
                "Overriding destination email from {OriginalEmail} to {OverrideEmail}",
                trimmedRecipient,
                destinationEmail);
        }

        var message = CreateMimeMessage(trimmedRecipient, destinationEmail, subject, plainTextBody);

        try
        {
            if (_usePickupDirectory && !string.IsNullOrWhiteSpace(_pickupDirectory))
            {
                await SaveToPickupDirectoryAsync(message, destinationEmail, cancellationToken);
                return;
            }

            await SendViaSmtpAsync(message, destinationEmail, cancellationToken);
        }
        catch (SmtpCommandException ex)
        {
            _logger.LogError(
                ex,
                "SMTP command failed with status {StatusCode} when sending email to {Email}. Response: {Response}",
                ex.StatusCode,
                destinationEmail,
                ex.Message);
            throw new EmailDeliveryException(
                $"SMTP command failed with status {ex.StatusCode}",
                ex);
        }
        catch (SmtpProtocolException ex)
        {
            _logger.LogError(
                ex,
                "SMTP protocol error while sending email to {Email}: {Message}",
                destinationEmail,
                ex.Message);
            throw new EmailDeliveryException("SMTP protocol error during email send.", ex);
        }
        catch (EmailDeliveryException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", destinationEmail);
            throw new EmailDeliveryException("Unexpected error while sending email.", ex);
        }
    }

    private async Task SendViaSmtpAsync(
        MimeMessage message,
        string destinationEmail,
        CancellationToken cancellationToken)
    {
        using var client = new MailKit.Net.Smtp.SmtpClient
        {
            CheckCertificateRevocation = _settings.CheckCertificateRevocation
        };

        if (!_settings.CheckCertificateRevocation)
        {
            _logger.LogDebug("SMTP certificate revocation checking disabled by configuration.");
        }

        try
        {
            var socketOptions = _settings.EnableSsl
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.Auto;

            await client.ConnectAsync(
                _settings.SmtpHost,
                _settings.SmtpPort,
                socketOptions,
                cancellationToken);

            if (_useOAuth)
            {
                if (_confidentialClient is null)
                {
                    throw new EmailDeliveryException("SMTP OAuth is enabled but the Azure AD credentials are not configured.");
                }

                if (string.IsNullOrWhiteSpace(_oauthUser))
                {
                    throw new EmailDeliveryException("SMTP OAuth requires a username or from address to authenticate.");
                }

                var accessToken = await AcquireOAuthTokenAsync(cancellationToken);
                var oauth2 = new SaslMechanismOAuth2(_oauthUser, accessToken);
                await client.AuthenticateAsync(oauth2, cancellationToken);
            }
            else
            {
                client.AuthenticationMechanisms.Remove("XOAUTH2");

                if (!string.IsNullOrWhiteSpace(_settings.Username))
                {
                    if (string.IsNullOrWhiteSpace(_settings.Password))
                    {
                        _logger.LogWarning(
                            "SMTP username {Username} configured without a password. Attempting to send without authentication.",
                            _settings.Username);
                    }
                    else
                    {
                        await client.AuthenticateAsync(
                            _settings.Username,
                            _settings.Password,
                            cancellationToken);
                    }
                }
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation(
                "Email for {Recipient} sent via SMTP server {Host}:{Port}",
                destinationEmail,
                _settings.SmtpHost,
                _settings.SmtpPort);
        }
        finally
        {
            if (client.IsConnected)
            {
                try
                {
                    await client.DisconnectAsync(true, CancellationToken.None);
                }
                catch
                {
                    // Ignore cleanup failures
                }
            }
        }
    }

    private async Task<string> AcquireOAuthTokenAsync(CancellationToken cancellationToken)
    {
        if (_confidentialClient is null)
        {
            throw new EmailDeliveryException("SMTP OAuth is enabled but the Azure AD credentials are not configured.");
        }

        try
        {
            var result = await _confidentialClient.Value
                .AcquireTokenForClient(new[] { _oauthScope })
                .ExecuteAsync(cancellationToken);

            if (string.IsNullOrWhiteSpace(result.AccessToken))
            {
                throw new EmailDeliveryException("Azure AD returned an empty access token for SMTP authentication.");
            }

            return result.AccessToken;
        }
        catch (MsalException ex)
        {
            _logger.LogError(
                ex,
                "Failed to acquire OAuth token for SMTP mailbox {Mailbox}",
                _oauthUser ?? _settings.Username ?? _settings.FromAddress ?? "(unknown)");
            throw new EmailDeliveryException(
                "Failed to authenticate with Outlook using OAuth. Verify the Azure AD application credentials and permissions.",
                ex);
        }
    }

    private async Task SaveToPickupDirectoryAsync(
        MimeMessage message,
        string destinationEmail,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_pickupDirectory))
        {
            throw new InvalidOperationException("Pickup directory is not configured.");
        }

        Directory.CreateDirectory(_pickupDirectory);

        var fileName = $"{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}.eml";
        var filePath = Path.Combine(_pickupDirectory, fileName);

        await using (var stream = File.Create(filePath))
        {
            await message.WriteToAsync(stream, cancellationToken);
        }

        _logger.LogInformation(
            "Email for {Recipient} saved to pickup directory {Directory}",
            destinationEmail,
            _pickupDirectory);
    }

    private MimeMessage CreateMimeMessage(
        string originalRecipient,
        string destinationEmail,
        string subject,
        string plainTextBody)
    {
        var message = new MimeMessage();

        var fromName = string.IsNullOrWhiteSpace(_settings.FromName)
            ? _settings.FromAddress
            : _settings.FromName;

        message.From.Add(new MailboxAddress(fromName, _settings.FromAddress));
        message.To.Add(MailboxAddress.Parse(destinationEmail));
        message.Subject = subject ?? string.Empty;
        message.Body = new TextPart(TextFormat.Plain)
        {
            Text = plainTextBody ?? string.Empty
        };

        if (!string.Equals(destinationEmail, originalRecipient, StringComparison.OrdinalIgnoreCase))
        {
            message.Headers.Add("X-Original-Recipient", originalRecipient);
            message.ReplyTo.Add(MailboxAddress.Parse(originalRecipient));
        }

        return message;
    }

    private static string? ResolvePickupDirectory(string? configuredDirectory, string contentRoot)
    {
        if (string.IsNullOrWhiteSpace(configuredDirectory))
        {
            return null;
        }

        var trimmed = configuredDirectory.Trim();

        if (Path.IsPathRooted(trimmed))
        {
            return Path.GetFullPath(trimmed);
        }

        var combined = Path.Combine(contentRoot, trimmed);
        return Path.GetFullPath(combined);
    }
}
