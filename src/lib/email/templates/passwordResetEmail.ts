import { escapeHtml } from "./loginNotificationEmail";

export interface PasswordResetEmailParams {
  userName: string;
  otp: string;
  expiresInMinutes?: number;
}

/**
 * Renders an ultra-luxury NOIR editorial HTML and plain-text email
 * for password reset OTP verification.
 */
export function renderPasswordResetEmail(params: PasswordResetEmailParams): {
  html: string;
  text: string;
} {
  const currentYear = new Date().getFullYear();
  const safeName = escapeHtml(params.userName || "Valued Client");
  const safeOtp = escapeHtml(params.otp);
  const minutes = params.expiresInMinutes || 10;

  // Plain Text Version
  const text = `NOIR ATELIER — PASSWORD RESET REQUEST

Hello ${safeName},

We received a request to reset the passkey for your NOIR Atelier account. To verify your identity and authorize this change, please enter the following verification code:

Verification Code: ${safeOtp}

This code expires in ${minutes} minutes.

Security Notice:
- Do not disclose this code to anyone. NOIR staff will never ask for your verification code.
- If you did not request a password reset, your account is still secure. Please disregard this notice or review your account activity.

© ${currentYear} NOIR ATELIER. All rights reserved.`;

  // Luxury HTML Version
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password | NOIR</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EDEDED; -webkit-font-smoothing: antialiased; line-height: 1.6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; width: 100%;">
    <tr>
      <td align="center" style="padding: 48px 16px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #121212; border: 1px solid #262626; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          
          <!-- Noir Wordmark Header -->
          <tr>
            <td style="background-color: #000000; padding: 36px 40px; text-align: center; border-bottom: 1px solid #222222;">
              <span style="font-size: 10px; letter-spacing: 0.35em; color: #888888; text-transform: uppercase; font-family: monospace; display: block; margin-bottom: 8px;">
                ATELIER SECURITY // PASSKEY RECOVERY
              </span>
              <h1 style="margin: 0; font-size: 28px; letter-spacing: 0.28em; color: #FFFFFF; font-weight: 300; text-transform: uppercase;">
                NOIR
              </h1>
            </td>
          </tr>

          <!-- Greeting & Instructions -->
          <tr>
            <td style="padding: 36px 40px 16px 40px;">
              <div style="display: inline-block; border: 1px solid #333333; background-color: #1A1A1A; padding: 5px 12px; border-radius: 2px; font-size: 10px; letter-spacing: 0.2em; font-weight: 500; text-transform: uppercase; color: #CCCCCC; margin-bottom: 22px;">
                Single-Use Reset Code
              </div>

              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 400; color: #FFFFFF; letter-spacing: -0.02em;">
                Hello ${safeName},
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #B3B3B3; line-height: 1.7;">
                We received a request to reset the passkey associated with your <strong>NOIR Atelier</strong> account. Please use the following single-use verification code to authorize creating a new passkey:
              </p>
            </td>
          </tr>

          <!-- OTP Code Display Card -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; border: 1px solid #2B2B2B; border-radius: 4px; text-align: center;">
                <tr>
                  <td style="padding: 28px 20px;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: #777777; font-weight: 600; display: block; margin-bottom: 10px;">
                      PASSWORD RESET CODE
                    </span>
                    <div style="font-size: 40px; font-weight: 700; letter-spacing: 0.35em; color: #FFFFFF; font-family: 'Courier New', Courier, monospace; margin: 0; padding: 4px 0;">
                      ${safeOtp}
                    </div>
                    <span style="font-size: 11px; color: #888888; display: block; margin-top: 12px; letter-spacing: 0.05em;">
                      Valid for <strong>${minutes} minutes</strong>. Single-use only.
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Callout -->
          <tr>
            <td style="padding: 0 40px 36px 40px;">
              <div style="background-color: #171717; border-left: 2px solid #555555; padding: 16px 20px; border-radius: 0 2px 2px 0;">
                <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.6;">
                  <strong>Security Advisory:</strong> If you did not initiate this request, your account credentials remain unchanged. Never disclose this verification code to anyone.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0D0D0D; padding: 24px 40px; text-align: center; border-top: 1px solid #1F1F1F;">
              <p style="margin: 0; font-size: 11px; color: #555555; letter-spacing: 0.05em;">
                © ${currentYear} NOIR Atelier. Designed for those who move differently.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html, text };
}
