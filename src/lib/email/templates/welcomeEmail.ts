import { escapeHtml } from "./loginNotificationEmail";

export interface WelcomeEmailParams {
  userName: string;
  email: string;
}

/**
 * Renders an ultra-luxurious dark editorial Welcome Email from NOIR Atelier.
 */
export function renderWelcomeEmail(params: WelcomeEmailParams): { html: string; text: string } {
  const currentYear = new Date().getFullYear();
  const safeName = escapeHtml(params.userName || "Valued Patron");
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://noir-fash.vercel.app";
  const shopUrl = `${siteUrl}/shop`;
  const accountUrl = `${siteUrl}/account`;

  // Plain Text Version (Required by Phase 7)
  const text = `WELCOME TO NOIR — YOUR JOURNEY BEGINS

Hello ${safeName},

Your email address has been successfully verified, and your NOIR Atelier account is now active.

At NOIR, we design for those who move differently — sculpting architectural silhouettes, precision tailoring, and uncompromising materiality for modern movement.

YOUR ATELIER PRIVILEGES:
- Archival Previews & Drops: Private access to seasonal lookbooks and numbered capsules.
- Bespoke Measurements: Store personal tailoring notes and silhouette preferences.
- Complimentary Global Courier: Tracked express delivery with carbon-neutral packaging.
- Dedicated Concierge: Seamless returns and styling advisory.

Explore our collection: ${shopUrl}
Access your client profile: ${accountUrl}

With distinction,
The NOIR Atelier Curators

© ${currentYear} NOIR ATELIER. All rights reserved.`;

  // Responsive HTML Version with Consistent Luxury Dark Aesthetics
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NOIR — Your Journey Begins</title>
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
        <!-- Email Container (Max 580px) -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #121212; border: 1px solid #262626; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          
          <!-- Noir Wordmark Header -->
          <tr>
            <td style="background-color: #000000; padding: 38px 40px; text-align: center; border-bottom: 1px solid #222222;">
              <span style="font-size: 10px; letter-spacing: 0.35em; color: #888888; text-transform: uppercase; font-family: monospace; display: block; margin-bottom: 8px;">
                MEMBERSHIP INAUGURATION
              </span>
              <h1 style="margin: 0; font-size: 28px; letter-spacing: 0.28em; color: #FFFFFF; font-weight: 300; text-transform: uppercase;">
                NOIR
              </h1>
            </td>
          </tr>

          <!-- Welcome Banner & Message -->
          <tr>
            <td style="padding: 38px 40px 24px 40px;">
              <div style="display: inline-block; border: 1px solid #333333; background-color: #1A1A1A; padding: 5px 12px; border-radius: 2px; font-size: 10px; letter-spacing: 0.2em; font-weight: 500; text-transform: uppercase; color: #CCCCCC; margin-bottom: 22px;">
                &#10022; Email Verified &amp; Active
              </div>

              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 400; color: #FFFFFF; letter-spacing: -0.02em;">
                Welcome to NOIR, ${safeName}.
              </h2>

              <p style="margin: 0 0 18px 0; font-size: 14px; color: #B3B3B3; line-height: 1.7;">
                Your client account is now fully verified. We are honored to welcome you into our atelier community.
              </p>

              <p style="margin: 0 0 24px 0; font-size: 14px; color: #B3B3B3; line-height: 1.7;">
                At <strong>NOIR</strong>, we design for those who move differently — sculpting architectural silhouettes, precision tailoring, and uncompromising materiality engineered for modern movement.
              </p>
            </td>
          </tr>

          <!-- Member Privileges Card -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; border: 1px solid #2B2B2B; border-radius: 4px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 20px; background-color: #1A1A1A; border-bottom: 1px solid #2B2B2B;">
                    <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; color: #CCCCCC;">
                      Your Atelier Privileges
                    </span>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      
                      <!-- Privilege 1 -->
                      <tr>
                        <td width="24" valign="top" style="padding-bottom: 16px; font-size: 13px; color: #FFFFFF;">
                          &#10022;
                        </td>
                        <td style="padding-bottom: 16px; padding-left: 8px;">
                          <strong style="font-size: 13px; color: #FFFFFF; display: block; margin-bottom: 2px;">Archival Previews &amp; Drops</strong>
                          <span style="font-size: 12px; color: #888888; line-height: 1.5;">Private invitations to seasonal lookbooks, numbered capsules, and limited edition garments.</span>
                        </td>
                      </tr>

                      <!-- Privilege 2 -->
                      <tr>
                        <td width="24" valign="top" style="padding-bottom: 16px; font-size: 13px; color: #FFFFFF;">
                          &#10022;
                        </td>
                        <td style="padding-bottom: 16px; padding-left: 8px;">
                          <strong style="font-size: 13px; color: #FFFFFF; display: block; margin-bottom: 2px;">Bespoke Measurement Notes</strong>
                          <span style="font-size: 12px; color: #888888; line-height: 1.5;">Store personalized silhouette preferences for rapid ordering and accurate atelier fittings.</span>
                        </td>
                      </tr>

                      <!-- Privilege 3 -->
                      <tr>
                        <td width="24" valign="top" style="padding-bottom: 16px; font-size: 13px; color: #FFFFFF;">
                          &#10022;
                        </td>
                        <td style="padding-bottom: 16px; padding-left: 8px;">
                          <strong style="font-size: 13px; color: #FFFFFF; display: block; margin-bottom: 2px;">Complimentary Global Courier</strong>
                          <span style="font-size: 12px; color: #888888; line-height: 1.5;">Tracked, signature-required courier deliveries with carbon-neutral packaging.</span>
                        </td>
                      </tr>

                      <!-- Privilege 4 -->
                      <tr>
                        <td width="24" valign="top" style="font-size: 13px; color: #FFFFFF;">
                          &#10022;
                        </td>
                        <td style="padding-left: 8px;">
                          <strong style="font-size: 13px; color: #FFFFFF; display: block; margin-bottom: 2px;">Dedicated Client Concierge</strong>
                          <span style="font-size: 12px; color: #888888; line-height: 1.5;">Hassle-free 30-day returns and real-time support from our styling curators.</span>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Call To Action Button -->
          <tr>
            <td style="padding: 0 40px 36px 40px; text-align: center;">
              <a href="${shopUrl}" style="display: inline-block; background-color: #FFFFFF; color: #000000; text-decoration: none; padding: 14px 34px; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600; border-radius: 2px;">
                Explore The Atelier Catalog &rarr;
              </a>
            </td>
          </tr>

          <!-- Curators Sign-Off -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <p style="margin: 0; font-size: 13px; color: #888888; line-height: 1.6;">
                Warmest regards,<br>
                <strong style="color: #FFFFFF;">The NOIR Atelier Curators</strong>
              </p>
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="background-color: #0D0D0D; border-top: 1px solid #1E1E1E; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 10px; color: #666666; letter-spacing: 0.05em;">
                You are receiving this notification because you created and verified an account at NOIR Atelier.
              </p>
              <p style="margin: 0; font-size: 10px; color: #555555; letter-spacing: 0.1em; text-transform: uppercase;">
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
