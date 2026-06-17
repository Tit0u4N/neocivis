<#-- NeoCivis — executeActions email template
     Detection strategy (most reliable first):
       1. user attribute emailTheme=townhall — set at user creation for ADMIN/EMPLOYEE
       2. link URL — client_id may appear as a visible query param depending on Keycloak version
       3. client.clientId — available in some Keycloak versions
     neocivis-townhall-app / ADMIN / EMPLOYEE → Town-hall style
     neocivis-citizen-app  / CITIZEN          → Citizen style (default)
-->
<#assign isTownHall = false>
<#attempt>
  <#if user?? && user.attributes?? && user.attributes["emailTheme"]??>
    <#assign _raw = user.attributes["emailTheme"]>
    <#if _raw?is_sequence>
      <#list _raw as _v><#if _v == "townhall"><#assign isTownHall = true></#if></#list>
    <#elseif _raw?is_string && _raw == "townhall">
      <#assign isTownHall = true>
    </#if>
  </#if>
<#recover>
</#attempt>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Change your NeoCivis password</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- ── Outer card ─────────────────────────────────────── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.10);">

          <#if isTownHall>
          <!-- ════════════════════════════════════════════════════
               TOWN-HALL STYLE
               ════════════════════════════════════════════════════ -->

          <!-- Blue accent bar (mirrors the h-1 bg-secondary stripe in the login Template) -->
          <tr>
            <td style="background-color:#2563eb;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Branding row -->
          <tr>
            <td style="background-color:#ffffff;padding:32px 40px 0 40px;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:700;color:#1e3a5f;letter-spacing:0.01em;">
                NeoCivis
              </span>
              &nbsp;
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;color:#64748b;letter-spacing:0.08em;text-transform:uppercase;">
                Municipal Portal
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:28px 40px 40px 40px;">

              <!-- Title + underline decoration (mirrors h2 + div h-0.5 w-12 bg-secondary in TownHall login) -->
              <h1 style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;
                          color:#1e3a5f;text-transform:uppercase;letter-spacing:0.04em;line-height:1.2;">
                Change Your Password
              </h1>
              <div style="width:40px;height:2px;background-color:#2563eb;margin-bottom:24px;"></div>

              <p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;
                         color:#1e293b;line-height:1.65;">
                Hi ${user.firstName!user.username},
              </p>
              <p style="margin:0 0 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;
                         color:#1e293b;line-height:1.65;">
                You requested to change the password for your NeoCivis municipal account.
                Click the button below to set a new password.
              </p>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="border-radius:6px;background-color:#1d4ed8;">
                    <a href="${link}" target="_blank"
                       style="display:inline-block;padding:13px 28px;
                              font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;
                              color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.02em;">
                      Change my password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;
                         color:#64748b;line-height:1.55;">
                This link will expire in <strong>${linkExpiration}</strong>.
                If you did not initiate this request, please disregard this email — no action is required.
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;
                         color:#94a3b8;line-height:1.55;">
                Unable to click the button? Copy and paste this URL into your browser:<br />
                <span style="color:#2563eb;word-break:break-all;">${link}</span>
              </p>
            </td>
          </tr>

          <#else>
          <!-- ════════════════════════════════════════════════════
               CITIZEN STYLE  (default — also covers neocivis-citizen-app)
               Inspired by: citizen-hero gradient + citizen-sheet white card
               ════════════════════════════════════════════════════ -->

          <!-- Hero header (mirrors citizen-hero layout) -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a3a4a 0%,#589ba0 100%);padding:40px 40px 36px 40px;">
              <p style="margin:0;font-family:'Outfit',Arial,sans-serif;font-size:32px;font-weight:900;
                         color:#ffffff;line-height:1.05;letter-spacing:-0.025em;">
                NeoCivis
              </p>
            </td>
          </tr>

          <!-- Sheet (mirrors citizen-sheet white panel) -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;">

              <!-- Title + teal underline -->
              <h1 style="margin:0 0 8px 0;font-family:'Outfit',Arial,sans-serif;font-size:22px;font-weight:700;
                          color:#0f172a;letter-spacing:-0.01em;line-height:1.2;">
                Change Your Password
              </h1>
              <div style="width:40px;height:3px;background-color:#589ba0;border-radius:2px;margin-bottom:28px;"></div>

              <p style="margin:0 0 16px 0;font-family:'Outfit',Arial,sans-serif;font-size:15px;
                         color:#334155;line-height:1.65;">
                Hi ${user.firstName!user.username},
              </p>
              <p style="margin:0 0 28px 0;font-family:'Outfit',Arial,sans-serif;font-size:15px;
                         color:#334155;line-height:1.65;">
                You requested to change your password on your NeoCivis account.
                Click the button below to set a new password.
              </p>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="border-radius:10px;background-color:#589ba0;">
                    <a href="${link}" target="_blank"
                       style="display:inline-block;padding:14px 28px;
                              font-family:'Outfit',Arial,sans-serif;font-size:15px;font-weight:600;
                              color:#ffffff;text-decoration:none;border-radius:10px;">
                      Change my password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;
                         color:#64748b;line-height:1.55;">
                This link will expire in <strong>${linkExpiration}</strong>.
                If you did not request a password change, simply ignore this email — your account remains secure.
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;
                         color:#94a3b8;line-height:1.55;">
                Can't click the button? Copy and paste this URL into your browser:<br />
                <span style="color:#589ba0;word-break:break-all;">${link}</span>
              </p>
            </td>
          </tr>

          </#if>

          <!-- ── Footer (shared) ──────────────────────────────── -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;
                        padding:18px 40px;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#94a3b8;">
                &copy; ${.now?string("yyyy")} NeoCivis<#if isTownHall> &mdash; Municipal Portal</#if>
              </p>
            </td>
          </tr>

        </table>
        <!-- ── /Outer card ───────────────────────────────────── -->

      </td>
    </tr>
  </table>

</body>
</html>
