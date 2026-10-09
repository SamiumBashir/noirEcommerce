export interface LoginNotificationEmailParams {
  userName: string;
  loginTime: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  supportUrl?: string;
}

/**
 * Escapes HTML sensitive characters to prevent HTML injection attacks (Section 11)
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Renders a responsive, cross-client compatible HTML security email template (Section 4 & 12)
 */
export function renderLoginNotificationEmail(
  params: LoginNotificationEmailParams
): { html: string; text: string } {
  const currentYear = new Date().getFullYear();
  const safeName = escapeHtml(params.userName || "Valued Client");
  const safeTime = escapeHtml(params.loginTime);
  const safeDevice = escapeHtml(params.device || "Desktop");
  const safeBrowser = escapeHtml(params.browser || "Web Browser");
  const safeOs = escapeHtml(params.os || "Unknown OS");
  const safeIp = escapeHtml(params.ip || "Unknown IP");
  const safeLocation = escapeHtml(params.location || "Unknown Location");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://noir-fash.vercel.app";
  const accountUrl = `${siteUrl}/account`;

  // Plain Text Version
  const text = `New Login Detected

Hello ${safeName},

Your account was successfully logged in.

Login Details:
- Date & Time: ${safeTime}
- Device: ${safeDevice}
- Browser: ${safeBrowser}
- Operating System: ${safeOs}
- IP Address: ${safeIp}
- Location: ${safeLocation}

If this was you, no action is required.

If you don't recognize this login, please secure your account immediately by changing your password and reviewing your recent login activity at ${accountUrl}.

© ${currentYear}NOIR ATELIER. All rights reserved.`;

  // Responsive, Table-Based HTML Version with Inline CSS
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Login Detected</title>
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
        <!-- Main Email Container (Max 600px) -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #D8D5CF; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #111111; padding: 32px 40px; text-align: center;">
              <span style="font-size: 11px; letter-spacing: 0.35em; color: #A0A0A0; text-transform: uppercase; font-family: monospace; display: block; margin-bottom: 6px;">
                SECURITY ADVISORY
              </span>
              <h1 style="margin: 0; font-size: 26px; letter-spacing: 0.2em; color: #F5F3EF; font-weight: 300; text-transform: uppercase;">
                NOIR <span style="font-weight: 200; font-size: 16px; color: #888888;">
              </span>
              </h1>
            </td>
          </tr>

          <!-- Security Badge & Greeting -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <div style="display: inline-block; background-color: #F0EDE6; padding: 6px 14px; border-radius: 20px; font-size: 11px; letter-spacing: 0.15em; font-weight: 600; text-transform: uppercase; color: #111111; margin-bottom: 20px;">
                &#128274; New Login Detected
              </div>

              <h2 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 500; color: #111111; letter-spacing: -0.02em;">
                Hello ${safeName},
              </h2>

              <p style="margin: 0 0 24px 0; font-size: 14px; color: #555555; line-height: 1.6;">
                Your account was successfully logged in to our web portal. If this activity was initiated by you, you can safely disregard this notice.
              </p>
            </td>
          </tr>

          <!-- Login Details Card -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFAF7; border: 1px solid #E5E2DC; border-radius: 4px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; background-color: #F0EDE6; border-bottom: 1px solid #E5E2DC;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #333333;">
                      Login Details
                    </span>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      
                      <!-- Date & Time -->
                      <tr>
                        <td width="38%" style="padding: 7px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #777777; font-weight: 500;">
                          Date &amp; Time
                        </td>
                        <td width="62%" style="padding: 7px 0; font-size: 13px; color: #111111; font-weight: 500;">
                          ${safeTime}
                        </td>
                      </tr>

                      <!-- Device -->
                      <tr>
                        <td style="padding: 7px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #777777; font-weight: 500; border-top: 1px solid #F0EDE6;">
                          Device
                        </td>
                        <td style="padding: 7px 0; font-size: 13px; color: #111111; font-weight: 500; border-top: 1px solid #F0EDE6;">
                          ${safeDevice}
                        </td>
                      </tr>

                      <!-- Browser -->
                      <tr>
                        <td style="padding: 7px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #777777; font-weight: 500; border-top: 1px solid #F0EDE6;">
                          Browser
                        </td>
                        <td style="padding: 7px 0; font-size: 13px; color: #111111; font-weight: 500; border-top: 1px solid #F0EDE6;">
                          ${safeBrowser}
                        </td>
                      </tr>

                      <!-- Operating System -->
                      <tr>
                        <td style="padding: 7px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #777777; font-weight: 500; border-top: 1px solid #F0EDE6;">
                          Operating System
                        </td>
                        <td style="padding: 7px 0; font-size: 13px; color: #111111; font-weight: 500; border-top: 1px solid #F0EDE6;">
                          ${safeOs}
                        </td>
                      </tr>

                      <!-- IP Address -->
                      <tr>
                        <td style="padding: 7px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #777777; font-weight: 500; border-top: 1px solid #F0EDE6;">
                          IP Address
                        </td>
                        <td style="padding: 7px 0; font-size: 13px; color: #111111; font-family: monospace; font-weight: 600; border-top: 1px solid #F0EDE6;">
                          ${safeIp}
                        </td>
                      </tr>

                      <!-- Location -->
                      <tr>
                        <td style="padding: 7px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #777777; font-weight: 500; border-top: 1px solid #F0EDE6;">
                          Location
                        </td>
                        <td style="padding: 7px 0; font-size: 13px; color: #111111; font-weight: 500; border-top: 1px solid #F0EDE6;">
                          ${safeLocation}
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Callout & Action Warning -->
          <tr>
            <td style="padding: 0 40px 35px 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFF9F2; border-left: 3px solid #E07A5F; padding: 18px 20px; border-radius: 0 4px 4px 0;">
                <tr>
                  <td style="font-size: 13px; color: #6A3A26; line-height: 1.6;">
                    <strong style="color: #2D1A12; display: block; margin-bottom: 4px;">Don't recognize this activity?</strong>
                    If you did not initiate this login session, someone else may have accessed your account. Please secure your account immediately by resetting your password and auditing recent sessions.
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <a href="${accountUrl}" style="display: inline-block; background-color: #111111; color: #F5F3EF; text-decoration: none; padding: 11px 22px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 600; border-radius: 2px;">
                      Secure My Account &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFAF7; border-top: 1px solid #EAE8E2; padding: 28px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #888888; letter-spacing: 0.05em;">
                This is an automated security advisory sent to protect your account. Please do not reply directly to this email.
              </p>
              <p style="margin: 0; font-size: 11px; color: #999999; letter-spacing: 0.08em; text-transform: uppercase;">
                &copy; ${currentYear}NOIR ATELIER. All rights reserved.
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
