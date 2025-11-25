using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AIPharm.Core.Exceptions;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;
using AIPharm.Core.Security;
using AIPharm.Core.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IRepository<User> _userRepository;
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _emailSender;
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<AuthController> _logger;

        private const string TwoFactorEmailSubject = "AIPharm login verification code";
        private const string RegistrationEmailSubject = "Welcome to AIPharm";

        public AuthController(
            IRepository<User> userRepository,
            IConfiguration configuration,
            IEmailSender emailSender,
            IOptions<EmailSettings> emailOptions,
            ILogger<AuthController> logger)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _emailSender = emailSender;
            _emailSettings = emailOptions.Value;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null || !VerifyPassword(user, request.Password))
                {
                    return Unauthorized(new { success = false, message = "Invalid email or password" });
                }

                if (RequiresTwoFactor(user))
                {
                    var challenge = await PrepareTwoFactorChallengeAsync(user, ignoreCooldown: true, HttpContext.RequestAborted);
                    var message = challenge.EmailSent
                        ? $"Two-factor verification required. A code has been sent to {challenge.DestinationEmail}."
                        : "Two-factor verification required. Please use the most recent code sent to your email.";

                    return Ok(new
                    {
                        success = true,
                        requiresTwoFactor = true,
                        message,
                        twoFactorToken = challenge.TwoFactorToken,
                        destinationEmail = challenge.DestinationEmail,
                        codeExpiresAt = challenge.CodeExpiresAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                        emailSent = challenge.EmailSent,
                        cooldownSeconds = Math.Max(0, (int)Math.Ceiling(challenge.CooldownRemaining.TotalSeconds))
                    });
                }

                if (!RequiresTwoFactor(user) && HasPendingTwoFactorState(user))
                {
                    ClearTwoFactorState(user);
                    await _userRepository.UpdateAsync(user);
                }

                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    success = true,
                    message = "Login successful",
                    token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        fullName = user.FullName,
                        phoneNumber = user.PhoneNumber,
                        address = user.Address,
                        isAdmin = user.IsAdmin,
                        isStaff = user.IsStaff,
                        createdAt = user.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                        isDeleted = user.IsDeleted
                    }
                });
            }
            catch (EmailDeliveryException ex)
            {
                _logger.LogError(ex, "Email delivery failed during login for {Email}", request.Email);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to send verification email. Please verify the Outlook SMTP credentials and security settings.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected server error during login for {Email}", request.Email);
                return StatusCode(500, new { success = false, message = "Server error", error = ex.Message });
            }
        }

        [HttpPost("verify-2fa")]
        public async Task<IActionResult> VerifyTwoFactor([FromBody] VerifyTwoFactorRequest request)
        {
            try
            {
                var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null || !RequiresTwoFactor(user))
                {
                    return Unauthorized(new { success = false, message = "Invalid verification request" });
                }

                var now = DateTime.UtcNow;

                if (string.IsNullOrEmpty(user.TwoFactorLoginToken) || !user.TwoFactorLoginTokenExpiry.HasValue || user.TwoFactorLoginTokenExpiry <= now)
                {
                    ClearTwoFactorState(user);
                    await _userRepository.UpdateAsync(user);
                    return Unauthorized(new { success = false, message = "Verification session expired. Please login again." });
                }

                if (!string.Equals(user.TwoFactorLoginToken, request.TwoFactorToken, StringComparison.Ordinal))
                {
                    return Unauthorized(new { success = false, message = "Invalid verification session" });
                }

                if (string.IsNullOrEmpty(user.TwoFactorEmailCodeHash) || !user.TwoFactorEmailCodeExpiry.HasValue || user.TwoFactorEmailCodeExpiry <= now)
                {
                    ClearTwoFactorState(user);
                    await _userRepository.UpdateAsync(user);
                    return Unauthorized(new { success = false, message = "Verification code expired. Please request a new code." });
                }

                if (!PasswordHasher.Verify(request.Code, user.TwoFactorEmailCodeHash))
                {
                    user.TwoFactorEmailCodeAttempts += 1;

                    if (user.TwoFactorEmailCodeAttempts >= _emailSettings.MaxVerificationAttempts)
                    {
                        ClearTwoFactorState(user);
                        await _userRepository.UpdateAsync(user);
                        return Unauthorized(new { success = false, message = "Too many invalid attempts. Please login again." });
                    }

                    await _userRepository.UpdateAsync(user);
                    var attemptsLeft = _emailSettings.MaxVerificationAttempts - user.TwoFactorEmailCodeAttempts;
                    return Unauthorized(new
                    {
                        success = false,
                        message = attemptsLeft > 0
                            ? $"Invalid verification code. {attemptsLeft} attempt(s) remaining."
                            : "Invalid verification code."
                    });
                }

                ClearTwoFactorState(user);
                await _userRepository.UpdateAsync(user);

                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    success = true,
                    message = "Login successful",
                    token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        fullName = user.FullName,
                        phoneNumber = user.PhoneNumber,
                        address = user.Address,
                        isAdmin = user.IsAdmin,
                        isStaff = user.IsStaff,
                        createdAt = user.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                        isDeleted = user.IsDeleted
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected server error during 2FA verification for {Email}", request.Email);
                return StatusCode(500, new { success = false, message = "Server error", error = ex.Message });
            }
        }

        [HttpPost("resend-2fa")]
        public async Task<IActionResult> ResendTwoFactor([FromBody] ResendTwoFactorRequest request)
        {
            try
            {
                var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null || !RequiresTwoFactor(user))
                {
                    return Unauthorized(new { success = false, message = "Invalid verification request" });
                }

                var now = DateTime.UtcNow;
                if (string.IsNullOrEmpty(user.TwoFactorLoginToken) || !user.TwoFactorLoginTokenExpiry.HasValue || user.TwoFactorLoginTokenExpiry <= now)
                {
                    ClearTwoFactorState(user);
                    await _userRepository.UpdateAsync(user);
                    return Unauthorized(new { success = false, message = "Verification session expired. Please login again." });
                }

                if (!string.Equals(user.TwoFactorLoginToken, request.TwoFactorToken, StringComparison.Ordinal))
                {
                    return Unauthorized(new { success = false, message = "Invalid verification session" });
                }

                var challenge = await PrepareTwoFactorChallengeAsync(user, ignoreCooldown: false, HttpContext.RequestAborted);

                return Ok(new
                {
                    success = true,
                    requiresTwoFactor = true,
                    emailSent = challenge.EmailSent,
                    destinationEmail = challenge.DestinationEmail,
                    message = challenge.EmailSent
                        ? $"A new verification code has been sent to {challenge.DestinationEmail}."
                        : $"Please wait before requesting another verification code. The last email was sent to {challenge.DestinationEmail}.",
                    twoFactorToken = challenge.TwoFactorToken,
                    codeExpiresAt = challenge.CodeExpiresAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    cooldownSeconds = Math.Max(0, (int)Math.Ceiling(challenge.CooldownRemaining.TotalSeconds))
                });
            }
            catch (EmailDeliveryException ex)
            {
                _logger.LogError(ex, "Email delivery failed during 2FA resend for {Email}", request.Email);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to send verification email. Please verify the Outlook SMTP credentials and security settings.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected server error during 2FA resend for {Email}", request.Email);
                return StatusCode(500, new { success = false, message = "Server error", error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (request.Password != request.ConfirmPassword)
                {
                    return BadRequest(new { success = false, message = "Passwords do not match" });
                }

                var existingUser = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (existingUser != null)
                {
                    return Conflict(new { success = false, message = "User with this email already exists" });
                }

                var user = new User
                {
                    Email = request.Email,
                    FullName = request.FullName,
                    PhoneNumber = request.PhoneNumber,
                    Address = request.Address,
                    PasswordHash = HashPassword(request.Password),
                    IsAdmin = false,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false,
                    TwoFactorEnabled = true
                };

                await _userRepository.AddAsync(user);

                var emailSent = await TrySendRegistrationEmailAsync(user, HttpContext.RequestAborted);

                var message = emailSent
                    ? $"Registration successful! A confirmation email has been sent to {user.Email}."
                    : "Registration successful! Please log in to continue.";

                return Ok(new
                {
                    success = true,
                    message,
                    emailSent,
                    destinationEmail = user.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Server error", error = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userRepository.FirstOrDefaultAsync(u => u.Id.ToString() == userId);
            if (user == null)
                return NotFound();

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                phoneNumber = user.PhoneNumber,
                address = user.Address,
                isAdmin = user.IsAdmin,
                isStaff = user.IsStaff,
                createdAt = user.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                isDeleted = user.IsDeleted
            });
        }

        private async Task<TwoFactorChallengeResult> PrepareTwoFactorChallengeAsync(User user, bool ignoreCooldown, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;

            if (string.IsNullOrEmpty(user.TwoFactorLoginToken) || !user.TwoFactorLoginTokenExpiry.HasValue || user.TwoFactorLoginTokenExpiry <= now)
            {
                user.TwoFactorLoginToken = OneTimePasswordGenerator.GenerateLoginToken();
                user.TwoFactorLoginTokenExpiry = now.AddMinutes(_emailSettings.CodeLifetimeMinutes);
            }

            var cooldownRemaining = TimeSpan.Zero;
            if (!ignoreCooldown && user.TwoFactorLastSentAt.HasValue)
            {
                var nextAllowed = user.TwoFactorLastSentAt.Value.AddSeconds(_emailSettings.ResendCooldownSeconds);
                if (nextAllowed > now)
                {
                    cooldownRemaining = nextAllowed - now;
                }
            }

            var shouldSendEmail = ignoreCooldown || cooldownRemaining == TimeSpan.Zero;
            string? verificationCode = null;
            var destinationEmail = string.IsNullOrWhiteSpace(_emailSettings.OverrideToAddress)
                ? user.Email
                : _emailSettings.OverrideToAddress;

            destinationEmail ??= user.Email;

            if (shouldSendEmail)
            {
                verificationCode = OneTimePasswordGenerator.GenerateNumericCode(_emailSettings.CodeLength);
                user.TwoFactorEmailCodeHash = PasswordHasher.Hash(verificationCode);
                user.TwoFactorEmailCodeExpiry = now.AddMinutes(_emailSettings.CodeLifetimeMinutes);
                user.TwoFactorEmailCodeAttempts = 0;
                user.TwoFactorLastSentAt = now;
            }

            await _userRepository.UpdateAsync(user);

            if (shouldSendEmail && verificationCode != null)
            {
                var body = BuildTwoFactorEmailBody(verificationCode);
                try
                {
                    await _emailSender.SendEmailAsync(user.Email, TwoFactorEmailSubject, body, cancellationToken);
                }
                catch
                {
                    ClearTwoFactorState(user);
                    await _userRepository.UpdateAsync(user);
                    throw;
                }

                return new TwoFactorChallengeResult(
                    user.TwoFactorLoginToken!,
                    destinationEmail,
                    user.TwoFactorEmailCodeExpiry!,
                    TimeSpan.Zero,
                    true);
            }

            return new TwoFactorChallengeResult(
                user.TwoFactorLoginToken!,
                destinationEmail,
                user.TwoFactorEmailCodeExpiry,
                cooldownRemaining,
                false);
        }

        private static void ClearTwoFactorState(User user)
        {
            user.TwoFactorEmailCodeHash = null;
            user.TwoFactorEmailCodeExpiry = null;
            user.TwoFactorEmailCodeAttempts = 0;
            user.TwoFactorLastSentAt = null;
            user.TwoFactorLoginToken = null;
            user.TwoFactorLoginTokenExpiry = null;
        }

        private static bool HasPendingTwoFactorState(User user) =>
            !string.IsNullOrEmpty(user.TwoFactorEmailCodeHash) ||
            user.TwoFactorEmailCodeExpiry.HasValue ||
            user.TwoFactorEmailCodeAttempts > 0 ||
            user.TwoFactorLastSentAt.HasValue ||
            !string.IsNullOrEmpty(user.TwoFactorLoginToken) ||
            user.TwoFactorLoginTokenExpiry.HasValue;

        private static bool RequiresTwoFactor(User user) =>
            user.TwoFactorEnabled && !user.IsAdmin && !user.IsStaff;

        private async Task<bool> TrySendRegistrationEmailAsync(User user, CancellationToken cancellationToken)
        {
            var greetingName = string.IsNullOrWhiteSpace(user.FullName) ? "there" : user.FullName;
            var body =
                $"Hi {greetingName},\n\n" +
                "Thanks for registering with AIPharm! Your account has been created successfully and two-factor authentication is enabled by default to keep your data secure.\n\n" +
                "You can now sign in using your email and password. When you log in, we'll email you a verification code to confirm it's really you.\n\n" +
                "If you didn't create this account, please contact our support team immediately.";

            try
            {
                await _emailSender.SendEmailAsync(user.Email, RegistrationEmailSubject, body, cancellationToken);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send registration confirmation email to {Email}", user.Email);
                return false;
            }
        }

        private string BuildTwoFactorEmailBody(string code)
        {
            return $"Your AIPharm verification code is {code}. It expires in {_emailSettings.CodeLifetimeMinutes} minute(s). " +
                   "If you did not request this code, please ignore this email.";
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName ?? user.Email),
                new Claim(ClaimTypes.Role, "User")
            };

            if (user.IsAdmin)
            {
                claims.Add(new Claim(ClaimTypes.Role, "Admin"));
            }
            else if (user.IsStaff)
            {
                claims.Add(new Claim(ClaimTypes.Role, "Staff"));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }

        private string HashPassword(string password) => PasswordHasher.Hash(password);

        private bool VerifyPassword(User user, string password) => PasswordHasher.Verify(password, user.PasswordHash);

        private sealed record TwoFactorChallengeResult(
            string TwoFactorToken,
            string DestinationEmail,
            DateTime? CodeExpiresAt,
            TimeSpan CooldownRemaining,
            bool EmailSent);
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class VerifyTwoFactorRequest
    {
        public string Email { get; set; } = string.Empty;
        public string TwoFactorToken { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }

    public class ResendTwoFactorRequest
    {
        public string Email { get; set; } = string.Empty;
        public string TwoFactorToken { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
    }
}
