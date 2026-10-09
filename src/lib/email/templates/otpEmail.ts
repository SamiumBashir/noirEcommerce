import { escapeHtml } from "./loginNotificationEmail";

export interface OtpEmailParams {
  userName: string;
  otp: string;
  expiresInMinutes?: number;
}

/**
 * Renders an ultra-luxury noir editorial HTML email and plain-text alternative
 * for single-use OTP account verification.
 */
export function renderOtpEmail(params: OtpEmailParams): { html: string; text: string } {
  const currentYear = new Date().getFullYear();
  const safeName = escapeHtml(params.userName || "Valued Client");
  const safeOtp = escapeHtml(params.otp);
  const minutes = params.expiresInMinutes || 10;

  // Plain Text Version (Required by Phase 4)
  const text = `NOIR ATELIER — VERIFY YOUR EMAIL ADDRESS

Hello ${safeName},

Thank you for initiating your membership with NOIR Atelier. To authenticate your email address and activate your account, please enter the following verification code:

Verification Code: ${safeOtp}

This code expires in ${minutes} minutes.

Security Notice:
If you did not create a NOIR account, you can safely ignore this email. Never disclose this code to anyone.

© ${currentYear} NOIR ATELIER. All rights reserved.`;

  // Responsive HTML Version with Luxury Noir (Black / Dark) Editorial Aesthetics
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email address | NOIR</title>
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
        <!-- Email Container (Max 560px) -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #121212; border: 1px solid #262626; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          
          <!-- Noir Wordmark Header -->
          <tr>
            <td style="background-color: #000000; padding: 36px 40px; text-align: center; border-bottom: 1px solid #222222;">
              <span style="font-size: 10px; letter-spacing: 0.35em; color: #888888; text-transform: uppercase; font-family: monospace; display: block; margin-bottom: 8px;">
                ATELIER AUTHENTICATION
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
                Single-Use Verification Code
              </div>

              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 400; color: #FFFFFF; letter-spacing: -0.02em;">
                Hello ${safeName},
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #B3B3B3; line-height: 1.7;">
                Thank you for initiating your membership with <strong>NOIR Atelier</strong>. To verify your email address and activate your account, please enter the following verification code in your browser:
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
                      VERIFICATION CODE
                    </span>
                    <div style="font-size: 40px; font-weight: 700; letter-spacing: 0.35em; color: #FFFFFF; font-family: 'Courier New', Courier, monospace; margin: 0; padding: 4px 0;">
                      ${safeOtp}
                    </div>
                    <span style="font-size: 11px; color: #888888; display: block; margin-top: 12px; letter-spacing: 0.05em;">
                      This code expires in <strong>${minutes} minutes</strong>.
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #171717; border-left: 3px solid #EDEDED; padding: 14px 18px; border-radius: 0 4px 4px 0;">
                <tr>
                  <td style="font-size: 12px; color: #A0A0A0; line-height: 1.6;">
                    <strong style="color: #EDEDED; display: block; margin-bottom: 2px;">Security Notice:</strong>
                    If you did not create a NOIR account, you can safely ignore this email. Never disclose this code to anyone.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="background-color: #0D0D0D; border-top: 1px solid #1E1E1E; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase;">
                &copy; ${currentYear} NOIR ATELIER. ALL RIGHTS RESERVED.
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
