import { escapeHtml } from "./loginNotificationEmail";

export interface OtpEmailParams {
  userName: string;
  otp: string;
  expiresInMinutes?: number;
}

/**
 * Renders a responsive, cross-client compatible HTML email for OTP account verification.
 */
export function renderOtpEmail(params: OtpEmailParams): { html: string; text: string } {
  const currentYear = new Date().getFullYear();
  const safeName = escapeHtml(params.userName || "Valued Client");
  const safeOtp = escapeHtml(params.otp);
  const minutes = params.expiresInMinutes || 10;

  // Plain Text Version
  const text = `NOIR ATELIER — ACCOUNT VERIFICATION

Hello ${safeName},

Thank you for initiating your membership with NOIR Atelier. To authenticate your email address and activate your account, please enter the following verification code:

Verification Code: ${safeOtp}

This code will expire in ${minutes} minutes. If you did not create a NOIR account, you can safely disregard this message.

© ${currentYear} NOIR ATELIER. All rights reserved.`;

  // Responsive, Table-Based HTML Version with Inline CSS
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOIR Atelier Account Verification</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F5F3EF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111; -webkit-font-smoothing: antialiased; line-height: 1.6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F5F3EF; width: 100%;">
    <tr>
      <td align="center" style="padding: 40px 15px;">
        <!-- Main Email Container (Max 580px) -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #D8D5CF; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #111111; padding: 32px 40px; text-align: center;">
              <span style="font-size: 11px; letter-spacing: 0.35em; color: #A0A0A0; text-transform: uppercase; font-family: monospace; display: block; margin-bottom: 6px;">
                ATELIER AUTHENTICATION
              </span>
              <h1 style="margin: 0; font-size: 26px; letter-spacing: 0.2em; color: #F5F3EF; font-weight: 300; text-transform: uppercase;">
                NOIR ATELIER
              </h1>
            </td>
          </tr>

          <!-- Security Badge & Greeting -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <div style="display: inline-block; background-color: #F0EDE6; padding: 6px 14px; border-radius: 20px; font-size: 11px; letter-spacing: 0.15em; font-weight: 600; text-transform: uppercase; color: #111111; margin-bottom: 20px;">
                &#128274; One-Time Verification Code
              </div>

              <h2 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 500; color: #111111; letter-spacing: -0.02em;">
                Hello ${safeName},
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #555555; line-height: 1.6;">
                Thank you for initiating your membership with <strong>NOIR Atelier</strong>. To verify your email address and activate your account, please enter the following single-use verification code in the registration portal:
              </p>
            </td>
          </tr>

          <!-- OTP Display Card -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFAF7; border: 1px solid #D8D5CF; border-radius: 4px; overflow: hidden; text-align: center;">
                <tr>
                  <td style="padding: 30px 20px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #777777; font-weight: 600; display: block; margin-bottom: 12px;">
                      VERIFICATION CODE
                    </span>
                    <div style="font-size: 38px; font-weight: 700; letter-spacing: 0.35em; color: #111111; font-family: 'Courier New', Courier, monospace; margin: 0; padding: 6px 0;">
                      ${safeOtp}
                    </div>
                    <span style="font-size: 12px; color: #888888; display: block; margin-top: 12px;">
                      Expires in <strong>${minutes} minutes</strong>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Advisory Box -->
          <tr>
            <td style="padding: 0 40px 35px 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F7F4; border-left: 3px solid #111111; padding: 16px 20px; border-radius: 0 4px 4px 0;">
                <tr>
                  <td style="font-size: 12px; color: #666666; line-height: 1.6;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px;">Security Notice:</strong>
                    Never disclose this one-time code to anyone. NOIR Atelier curators will never ask for your verification code via email, SMS, or phone.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFAF7; border-top: 1px solid #EAE8E2; padding: 28px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #888888; letter-spacing: 0.05em;">
                If you did not initiate this account creation, you may disregard this notice.
              </p>
              <p style="margin: 0; font-size: 11px; color: #999999; letter-spacing: 0.08em; text-transform: uppercase;">
                &copy; ${currentYear} NOIR ATELIER. All rights reserved.
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
