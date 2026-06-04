type Props = {
  clientId: 'neocivis-citizen-app' | 'neocivis-townhall-app' | string;
  firstName?: string;
  link?: string;
  linkExpiration?: string;
  year?: number;
};

export function ExecuteActionsEmail({
  clientId,
  firstName = 'John',
  link = '#',
  linkExpiration = '5 minutes',
  year = new Date().getFullYear(),
}: Props) {
  const isTownHall = clientId === 'neocivis-townhall-app';

  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ backgroundColor: '#f1f5f9', padding: '32px 16px', borderCollapse: 'collapse' }}
    >
      <tbody>
        <tr>
          <td align="center">
            <table
              role="presentation"
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              style={{
                maxWidth: 600,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                borderCollapse: 'collapse',
              }}
            >
              <tbody>
                {isTownHall ? <TownHallEmail firstName={firstName} link={link} linkExpiration={linkExpiration} year={year} /> : <CitizenEmail firstName={firstName} link={link} linkExpiration={linkExpiration} year={year} />}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

type InnerProps = {
  firstName: string;
  link: string;
  linkExpiration: string;
  year: number;
};

function CitizenEmail({ firstName, link, linkExpiration, year }: InnerProps) {
  return (
    <>
      {/* Hero header — mirrors citizen-hero gradient */}
      <tr>
        <td
          style={{
            background: 'linear-gradient(135deg,#1a3a4a 0%,#589ba0 100%)',
            padding: '40px 40px 36px 40px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "'Outfit',Arial,sans-serif",
              fontSize: 32,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
            }}
          >
            NeoCivis
          </p>
        </td>
      </tr>

      {/* Sheet body — mirrors citizen-sheet white panel */}
      <tr>
        <td style={{ backgroundColor: '#ffffff', padding: '40px' }}>
          <h1
            style={{
              margin: '0 0 8px 0',
              fontFamily: "'Outfit',Arial,sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            Change Your Password
          </h1>
          <div
            style={{
              width: 40,
              height: 3,
              backgroundColor: '#589ba0',
              borderRadius: 2,
              marginBottom: 28,
            }}
          />

          <p
            style={{
              margin: '0 0 16px 0',
              fontFamily: "'Outfit',Arial,sans-serif",
              fontSize: 15,
              color: '#334155',
              lineHeight: 1.65,
            }}
          >
            Hi {firstName},
          </p>
          <p
            style={{
              margin: '0 0 28px 0',
              fontFamily: "'Outfit',Arial,sans-serif",
              fontSize: 15,
              color: '#334155',
              lineHeight: 1.65,
            }}
          >
            You requested to change your password on your NeoCivis account. Click the button below to set a new
            password.
          </p>

          {/* CTA */}
          <table role="presentation" cellPadding={0} cellSpacing={0} style={{ marginBottom: 28, borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ borderRadius: 10, backgroundColor: '#589ba0' }}>
                  <a
                    href={link}
                    style={{
                      display: 'inline-block',
                      padding: '14px 28px',
                      fontFamily: "'Outfit',Arial,sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: 10,
                    }}
                  >
                    Change my password
                  </a>
                </td>
              </tr>
            </tbody>
          </table>

          <p
            style={{
              margin: '0 0 8px 0',
              fontFamily: 'Arial,Helvetica,sans-serif',
              fontSize: 13,
              color: '#64748b',
              lineHeight: 1.55,
            }}
          >
            This link will expire in <strong>{linkExpiration}</strong>. If you did not request a password change,
            simply ignore this email — your account remains secure.
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: 'Arial,Helvetica,sans-serif',
              fontSize: 12,
              color: '#94a3b8',
              lineHeight: 1.55,
            }}
          >
            Can't click the button? Copy and paste this URL into your browser:
            <br />
            <span style={{ color: '#589ba0', wordBreak: 'break-all' }}>{link}</span>
          </p>
        </td>
      </tr>

      <EmailFooter year={year} isTownHall={false} />
    </>
  );
}

function TownHallEmail({ firstName, link, linkExpiration, year }: InnerProps) {
  return (
    <>
      {/* Blue accent bar — mirrors h-1 bg-secondary stripe */}
      <tr>
        <td style={{ backgroundColor: '#2563eb', height: 4, fontSize: 0, lineHeight: 0 }}>&nbsp;</td>
      </tr>

      {/* Branding */}
      <tr>
        <td style={{ backgroundColor: '#ffffff', padding: '32px 40px 0 40px' }}>
          <span
            style={{
              fontFamily: 'Arial,Helvetica,sans-serif',
              fontSize: 17,
              fontWeight: 700,
              color: '#1e3a5f',
              letterSpacing: '0.01em',
            }}
          >
            NeoCivis
          </span>{' '}
          <span
            style={{
              fontFamily: 'Arial,Helvetica,sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: '#64748b',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Municipal Portal
          </span>
        </td>
      </tr>

      {/* Body */}
      <tr>
        <td style={{ backgroundColor: '#ffffff', padding: '28px 40px 40px 40px' }}>
          {/* Title + underline decoration — mirrors h2 + div underline in TownHall Template */}
          <h1
            style={{
              margin: '0 0 6px 0',
              fontFamily: 'Arial,Helvetica,sans-serif',
              fontSize: 20,
              fontWeight: 700,
              color: '#1e3a5f',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              lineHeight: 1.2,
            }}
          >
            Change Your Password
          </h1>
          <div style={{ width: 40, height: 2, backgroundColor: '#2563eb', marginBottom: 24 }} />

          <p
            style={{
              margin: '0 0 14px 0',
              fontFamily: 'Arial,Helvetica,sans-serif',
              fontSize: 15,
              color: '#1e293b',
              lineHeight: 1.65,
            }}
          >
            Hi {firstName},
          </p>
          <p
            style={{
              margin: '0 0 28px 0',
              fontFamily: 'Arial,Helvetica,sans-serif',
              fontSize: 15,
              color: '#1e293b',
              lineHeight: 1.65,
            }}
          >
            You requested to change the password for your NeoCivis municipal account. Click the button below to set a
            new password.
          </p>

          {/* CTA */}
          <table role="presentation" cellPadding={0} cellSpacing={0} style={{ marginBottom: 28, borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ borderRadius: 6, backgroundColor: '#1d4ed8' }}>
                  <a
                    href={link}
                    style={{
                      display: 'inline-block',
                      padding: '13px 28px',
                      fontFamily: 'Arial,Helvetica,sans-serif',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: 6,
                      letterSpacing: '0.02em',
                    }}
                  >
                    Change my password
                  </a>
                </td>
              </tr>
            </tbody>
          </table>

          <p
            style={{
              margin: '0 0 8px 0',
              fontFamily: 'Arial,Helvetica,sans-serif',
              fontSize: 13,
              color: '#64748b',
              lineHeight: 1.55,
            }}
          >
            This link will expire in <strong>{linkExpiration}</strong>. If you did not initiate this request, please
            disregard this email — no action is required.
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: 'Arial,Helvetica,sans-serif',
              fontSize: 12,
              color: '#94a3b8',
              lineHeight: 1.55,
            }}
          >
            Unable to click the button? Copy and paste this URL:
            <br />
            <span style={{ color: '#2563eb', wordBreak: 'break-all' }}>{link}</span>
          </p>
        </td>
      </tr>

      <EmailFooter year={year} isTownHall />
    </>
  );
}

function EmailFooter({ year, isTownHall }: { year: number; isTownHall: boolean }) {
  return (
    <tr>
      <td
        style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '18px 40px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'Arial,Helvetica,sans-serif',
            fontSize: 12,
            color: '#94a3b8',
          }}
        >
          &copy; {year} NeoCivis{isTownHall ? ' — Municipal Portal' : ''}
        </p>
      </td>
    </tr>
  );
}
