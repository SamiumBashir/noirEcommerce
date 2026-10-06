import { escapeHtml } from "./loginNotificationEmail";

export interface WelcomeEmailParams {
  userName: string;
  email: string;
}

/**
 * Renders an ultra-luxurious Welcome Wish email from NOIR Atelier.
 */
export function renderWelcomeEmail(params: WelcomeEmailParams): { html: string; text: string } {
  const currentYear = new Date().getFullYear();
  const safeName = escapeHtml(params.userName || "Valued Patron");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://noir-fash.vercel.app";
  const shopUrl = `${siteUrl}/shop`;
  const accountUrl = `${siteUrl}/account`;

  // Plain Text Version
  const text = `WELCOME TO NOIR ATELIER

Hello ${safeName},

Your atelier membership is officially authenticated and active.

At NOIR, we design for those who move differently — sculpting architectural silhouettes, precision tailoring, and uncompromising materiality for modern movement.

YOUR MEMBERSHIP PRIVILEGES:
- Archival Releases & Drops: Private access to seasonal capsules and limited batch releases.
- Bespoke Measurements: Maintain your personal tailoring preferences and sizing notes.
- Complimentary Global Courier: Tracked express courier delivery with signature service.
- Dedicated Concierge: Seamless returns and personal stylist advisory.

Explore our collection: ${shopUrl}
Access your client profile: ${accountUrl}

With distinction,
The NOIR Atelier Curators

© ${currentYear} NOIR ATELIER. All rights reserved.`;

  // Responsive, Table-Based HTML Version with Inline CSS
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NOIR Atelier</title>
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
            <td style="background-color: #111111; padding: 36px 40px; text-align: center;">
              <span style="font-size: 11px; letter-spacing: 0.35em; color: #A0A0A0; text-transform: uppercase; font-family: monospace; display: block; margin-bottom: 6px;">
                MEMBERSHIP INAUGURATION
              </span>
              <h1 style="margin: 0; font-size: 28px; letter-spacing: 0.22em; color: #F5F3EF; font-weight: 300; text-transform: uppercase;">
                NOIR ATELIER
              </h1>
            </td>
          </tr>

          <!-- Welcome Banner & Message -->
          <tr>
            <td style="padding: 40px 40px 24px 40px;">
              <div style="display: inline-block; background-color: #F0EDE6; padding: 6px 14px; border-radius: 20px; font-size: 11px; letter-spacing: 0.15em; font-weight: 600; text-transform: uppercase; color: #111111; margin-bottom: 20px;">
                &#10022; Account Verified &amp; Active
              </div>

              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 400; color: #111111; letter-spacing: -0.02em;">
                Welcome to NOIR, ${safeName}.
              </h2>

              <p style="margin: 0 0 18px 0; font-size: 14px; color: #555555; line-height: 1.7;">
                Your client account is now fully verified. We are honored to welcome you into our atelier community.
              </p>

              <p style="margin: 0 0 24px 0; font-size: 14px; color: #555555; line-height: 1.7;">
                At <strong>NOIR</strong>, we design for those who move differently — sculpting architectural silhouettes, precision tailoring, and uncompromising materiality engineered for modern movement.
              </p>
            </td>
          </tr>

          <!-- Member Privileges Card -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFAF7; border: 1px solid #E5E2DC; border-radius: 4px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; background-color: #F0EDE6; border-bottom: 1px solid #E5E2DC;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #333333;">
                      Your Atelier Privileges
                    </span>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      
                      <!-- Privilege 1 -->
                      <tr>
                        <td width="24" valign="top" style="padding-bottom: 16px; font-size: 14px; color: #111111;">
                          &#10022;
                        </td>
                        <td style="padding-bottom: 16px; padding-left: 8px;">
                          <strong style="font-size: 13px; color: #111111; display: block; margin-bottom: 2px;">Archival Previews &amp; Drops</strong>
                          <span style="font-size: 12px; color: #666666; line-height: 1.5;">Private invitations to seasonal lookbooks, numbered capsules, and limited edition garments.</span>
                        </td>
                      </tr>

                      <!-- Privilege 2 -->
                      <tr>
                        <td width="24" valign="top" style="padding-bottom: 16px; font-size: 14px; color: #111111;">
                          &#10022;
                        </td>
                        <td style="padding-bottom: 16px; padding-left: 8px;">
                          <strong style="font-size: 13px; color: #111111; display: block; margin-bottom: 2px;">Bespoke Measurement Notes</strong>
                          <span style="font-size: 12px; color: #666666; line-height: 1.5;">Store personalized silhouette preferences for rapid ordering and accurate atelier fittings.</span>
                        </td>
                      </tr>

                      <!-- Privilege 3 -->
                      <tr>
                        <td width="24" valign="top" style="padding-bottom: 16px; font-size: 14px; color: #111111;">
                          &#10022;
                        </td>
                        <td style="padding-bottom: 16px; padding-left: 8px;">
                          <strong style="font-size: 13px; color: #111111; display: block; margin-bottom: 2px;">Complimentary Global Courier</strong>
                          <span style="font-size: 12px; color: #666666; line-height: 1.5;">Tracked, signature-required courier deliveries with carbon-neutral packaging.</span>
                        </td>
                      </tr>

                      <!-- Privilege 4 -->
                      <tr>
                        <td width="24" valign="top" style="font-size: 14px; color: #111111;">
                          &#10022;
                        </td>
                        <td style="padding-left: 8px;">
                          <strong style="font-size: 13px; color: #111111; display: block; margin-bottom: 2px;">Dedicated Client Concierge</strong>
                          <span style="font-size: 12px; color: #666666; line-height: 1.5;">Hassle-free 30-day returns and real-time support from our styling curators.</span>
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
            <td style="padding: 0 40px 35px 40px; text-align: center;">
              <a href="${shopUrl}" style="display: inline-block; background-color: #111111; color: #F5F3EF; text-decoration: none; padding: 14px 32px; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600; border-radius: 2px;">
                Explore The Atelier Catalog &rarr;
              </a>
            </td>
          </tr>

          <!-- Curators Sign-Off -->
          <tr>
            <td style="padding: 0 40px 35px 40px;">
              <p style="margin: 0; font-size: 13px; color: #555555; line-height: 1.6;">
                Warmest regards,<br>
                <strong style="color: #111111;">The NOIR Atelier Curators</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFAF7; border-top: 1px solid #EAE8E2; padding: 28px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #888888; letter-spacing: 0.05em;">
                You are receiving this welcome note because you created an account at NOIR Atelier.
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
