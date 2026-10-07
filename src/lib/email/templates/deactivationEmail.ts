export interface DeactivationEmailData {
  userName: string;
  email: string;
  deactivatedAt: string;
  reason?: string;
}

function sanitizeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderDeactivationEmail(data: DeactivationEmailData): {
  html: string;
  text: string;
} {
  const currentYear = new Date().getFullYear();
  const safeName = sanitizeHtml(data.userName);
  const safeEmail = sanitizeHtml(data.email);
  const safeDate = sanitizeHtml(data.deactivatedAt);
  const safeReason = data.reason ? sanitizeHtml(data.reason) : null;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Deactivated — NOIR Atelier</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #ecebe8; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0b0b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #121212; border: 1px solid #242424; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center; border-bottom: 1px solid #1e1e1e; background: linear-gradient(180deg, #161616 0%, #121212 100%);">
              <span style="font-size: 11px; letter-spacing: 0.35em; color: #888888; text-transform: uppercase; display: block; margin-bottom: 8px;">PRIVATE ATELIER MEMBERSHIP</span>
              <h1 style="margin: 0; font-size: 26px; font-weight: 300; letter-spacing: 0.18em; text-transform: uppercase; color: #ffffff;">NOIR ATELIER</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 40px 24px;">
              <div style="display: inline-block; padding: 4px 10px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 20px;">
                MEMBERSHIP DEACTIVATED
              </div>

              <h2 style="margin: 0 0 14px 0; font-size: 20px; font-weight: 400; color: #ffffff; letter-spacing: 0.05em;">
                Your Account Has Been Deactivated
              </h2>
              
              <p style="margin: 0 0 18px 0; font-size: 13px; line-height: 1.7; color: #a0a0a0;">
                Dear ${safeName}, this is an official confirmation that your NOIR Atelier account associated with <strong style="color: #ffffff;">${safeEmail}</strong> has been successfully deactivated on <span style="color: #ffffff;">${safeDate}</span>.
              </p>

              ${safeReason ? `
              <div style="background-color: #171717; border-left: 2px solid #888; padding: 12px 16px; margin: 18px 0; font-size: 12px; color: #b5b5b5;">
                <span style="text-transform: uppercase; font-size: 10px; letter-spacing: 0.15em; color: #777; display: block; margin-bottom: 4px;">Reason Provided:</span>
                "${safeReason}"
              </div>` : ""}

              <p style="margin: 0 0 18px 0; font-size: 13px; line-height: 1.7; color: #a0a0a0;">
                As a result of this action:
              </p>

              <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 12px; line-height: 1.9; color: #8c8c8c;">
                <li>Your private bespoke reservations and cart sessions have been cleared.</li>
                <li>You have been signed out across all mobile and web sessions.</li>
                <li>Your account access is currently disabled for future sign-ins.</li>
              </ul>

              <div style="background: #171717; border: 1px solid #222222; padding: 18px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #d0d0d0; font-weight: 500;">
                  Was this deactivation unintentional?
                </p>
                <p style="margin: 0; font-size: 11px; line-height: 1.6; color: #888888;">
                  If you did not request this deactivation or wish to reactivate your private patron account, please reach out to our concierge immediately at <a href="mailto:support@noir.studio" style="color: #ffffff; text-decoration: underline;">concierge@noir.studio</a>.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #1a1a1a; text-align: center; background-color: #0e0e0e;">
              <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 0.15em; color: #777777; text-transform: uppercase;">
                NOIR ATELIER // HAUTE COUTURE &amp; BESPOKE TAILORING
              </p>
              <p style="margin: 0; font-size: 10px; color: #444444;">
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

  const text = `NOIR ATELIER — ACCOUNT DEACTIVATED

Dear ${data.userName},

This is an official confirmation that your NOIR Atelier account (${data.email}) has been deactivated on ${data.deactivatedAt}.

${data.reason ? `Reason: "${data.reason}"\n\n` : ""}All active sessions have been terminated. If you did not request this, contact concierge@noir.studio immediately.

© ${currentYear} NOIR ATELIER. All rights reserved.`;

  return { html, text };
}
