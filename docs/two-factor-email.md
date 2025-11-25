# Email-based Two-Factor Authentication

The backend now enforces email-based two-factor authentication (2FA) for every customer account. After a user enters valid credentials, a short-lived verification code is sent to the account's email address. The login flow completes only after the code is confirmed. Administrative users and staff accounts are excluded from the 2FA requirement so they can access internal tooling without an extra verification step.

## How it works

1. **Password check** – `POST /api/auth/login` validates the email/password pair. If the account has 2FA enabled, the API responds with `requiresTwoFactor: true` and a `twoFactorToken` representing the pending login session. A numeric code is sent to the user via email.
2. **Code verification** – `POST /api/auth/verify-2fa` consumes the `twoFactorToken` plus the code from the email. A JWT is issued only after successful verification.
3. **Optional resend** – `POST /api/auth/resend-2fa` resends a new code (honouring cooldown/attempt limits) for the same pending login session.

The pending login session and verification code expire 10 minutes after they are issued. Five incorrect codes in a row invalidate the session.

## Configuring email delivery

The service uses the `Email` section in `appsettings*.json`:

```json
"Email": {
  "FromAddress": "aipharmproject@gmail.com",
  "FromName": "AIPharm",
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": 587,
  "EnableSsl": true,
  "Username": "aipharmproject@gmail.com",
  "Password": "vdzotamtdvlirmpt",
  "PickupDirectory": "App_Data/Emails",
  "UsePickupDirectory": false,
  "CheckCertificateRevocation": false
}
```

- **Sender account:** The backend uses the dedicated Gmail mailbox `aipharmproject@gmail.com`. Use the Gmail app password `vdzotamtdvlirmpt` (copy it without spaces) for SMTP authentication and update the configuration if you ever rotate the secret or move to another provider.
- **Per-user delivery:** Leave `OverrideToAddress` unset so verification codes are sent to each account's email address.
- **Local pickup folder (optional):** Set `UsePickupDirectory` to `true` if you want `.eml` files written to `AIPharm.Backend/AIPharm.Web/App_Data/Emails` instead of dispatching through Gmail. This is helpful when testing with fictional mailboxes because the messages never leave your machine.
- **SMTP host:** Gmail uses `smtp.gmail.com` on port `587` with STARTTLS (`EnableSsl: true`). Adjust the settings if you switch providers.
- **Secrets:** For production scenarios store credentials securely (environment variables, user-secrets, Key Vault, etc.).

### Gmail SMTP checklist

If no email arrives in your inbox:

- **Confirm 2-Step Verification and the app password** – Visit your [Google Account security page](https://myaccount.google.com/security), enable 2-Step Verification, and create an App Password for "Mail". Paste the 16-character password (without spaces) into `appsettings*.json`.
- **Allow IMAP/SMTP access** – In Gmail's *Settings → Forwarding and POP/IMAP*, keep IMAP enabled. Gmail rejects SMTP connections that rely on app passwords when IMAP access is disabled.
- **Verify credentials** – The `Username` and `Password` in `appsettings*.json` must match the Gmail mailbox exactly. Rebuild the backend container after updating these secrets.
- **Keep pickup disabled** – Set `UsePickupDirectory` to `false` when you expect real emails. When enabled, messages are saved as `.eml` files under `AIPharm.Backend/AIPharm.Web/App_Data/Emails` and no outbound SMTP attempt is made.
- **Certificate revocation checks** – `CheckCertificateRevocation` is disabled by default to avoid TLS handshake failures in restricted environments where CRL/OCSP endpoints are unreachable. Enable it only when the hosting environment allows outbound HTTPS to Google's revocation services.
- **Check backend logs** – `docker-compose logs backend` should contain `Email for <recipient> sent via SMTP server smtp.gmail.com:587`. Any `Failed to send email` entries include the raw SMTP error for troubleshooting.

## Example sequence (Gmail delivery)

```bash
# 1) Login with credentials
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aipharmproject@gmail.com","password":"Admin123!"}'

# Response excerpt
# {
#   "requiresTwoFactor": true,
#   "twoFactorToken": "...",
#   "codeExpiresAt": "2025-09-18T11:22:33.123Z"
# }

# 2) Retrieve the code from your inbox (the sender is aipharmproject@gmail.com). If you enabled the pickup directory, the `.eml` file is stored under AIPharm.Backend/AIPharm.Web/App_Data/Emails instead of being sent.

# 3) Submit the code + token to finish authentication
curl -X POST http://localhost:8080/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{
  "email":"aipharmproject@gmail.com",
  "twoFactorToken":"<token-from-step-1>",
  "code":"123456"
}'
```

If the code expires or the email is lost, call `POST /api/auth/resend-2fa` with the same email and `twoFactorToken`. Respect the cooldown (60 seconds by default) between resends.
