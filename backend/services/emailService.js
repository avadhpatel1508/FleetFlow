import nodemailer from 'nodemailer';

// Lazily create the transporter so dotenv has already loaded the env vars
const getTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const emailStyle = `
    font-family: 'Poppins', Arial, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    padding: 40px 20px;
    text-align: center;
`;
const cardStyle = `
    background: #1e293b;
    border-radius: 16px;
    padding: 40px;
    max-width: 480px;
    margin: 0 auto;
    border: 1px solid #334155;
`;

export const sendOTPEmail = async (to, otp) => {
  await getTransporter().sendMail({
    from: `"FleetFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔐 Your FleetFlow Verification Code',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#4f46e5,#06b6d4);border-radius:10px;display:flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:20px;font-weight:900;">F</span>
              </div>
              <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Fleet<span style="color:#818cf8;">Flow</span></span>
            </div>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#1e293b;border-radius:20px;border:1px solid #334155;overflow:hidden;">

            <!-- Top accent bar -->
            <div style="height:4px;background:linear-gradient(90deg,#4f46e5,#06b6d4,#818cf8);"></div>

            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px;">
              <!-- Icon + Title -->
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <div style="width:64px;height:64px;background:#312e81;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:28px;">🔐</span>
                  </div>
                  <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff;">Verify Your Email</h1>
                  <p style="margin:8px 0 0;color:#94a3b8;font-size:15px;">You're one step away from accessing FleetFlow</p>
                </td>
              </tr>

              <!-- Instruction -->
              <tr>
                <td style="padding-bottom:24px;">
                  <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;text-align:center;">
                    Use the verification code below to confirm your email address.<br>This code expires in <strong style="color:#f59e0b;">10 minutes</strong>.
                  </p>
                </td>
              </tr>

              <!-- OTP Box -->
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <div style="display:inline-block;background:#0f172a;border:2px solid #4f46e5;border-radius:16px;padding:20px 40px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Verification Code</p>
                    <p style="margin:0;font-size:42px;font-weight:700;letter-spacing:12px;color:#818cf8;font-family:'Courier New',monospace;">${otp}</p>
                  </div>
                </td>
              </tr>

              <!-- Steps -->
              <tr>
                <td style="background:#0f172a;border-radius:12px;padding:20px;border:1px solid #1e293b;">
                  <p style="margin:0 0 12px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">How to verify</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${['Go back to the FleetFlow app', 'Enter the 6-digit code shown above', 'Your account will be activated instantly'].map((step, i) => `
                    <tr>
                      <td width="28" valign="top" style="padding-bottom:8px;">
                        <div style="width:22px;height:22px;background:#312e81;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#818cf8;">${i + 1}</div>
                      </td>
                      <td style="padding-bottom:8px;padding-left:10px;color:#94a3b8;font-size:13px;line-height:22px;">${step}</td>
                    </tr>`).join('')}
                  </table>
                </td>
              </tr>

              <!-- Warning -->
              <tr>
                <td style="padding-top:20px;">
                  <p style="margin:0;font-size:12px;color:#64748b;text-align:center;line-height:1.5;">
                    ⚠️ If you didn't create a FleetFlow account, you can safely ignore this email.<br>
                    Never share this code with anyone.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:24px;">
            <p style="margin:0;color:#334155;font-size:12px;">© 2025 FleetFlow · Fleet Management System</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
  });
};

export const sendPasswordResetEmail = async (to, otp) => {
  await getTransporter().sendMail({
    from: `"FleetFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔑 Your FleetFlow Password Reset Code',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#4f46e5,#06b6d4);border-radius:10px;display:flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:20px;font-weight:900;">F</span>
              </div>
              <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Fleet<span style="color:#818cf8;">Flow</span></span>
            </div>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#1e293b;border-radius:20px;border:1px solid #334155;overflow:hidden;">
            <div style="height:4px;background:linear-gradient(90deg,#dc2626,#f59e0b,#ef4444);"></div>
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px;">
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <div style="width:64px;height:64px;background:#450a0a;border-radius:50%;margin:0 auto 16px;text-align:center;line-height:64px;">
                    <span style="font-size:28px;">🔑</span>
                  </div>
                  <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff;">Reset Your Password</h1>
                  <p style="margin:8px 0 0;color:#94a3b8;font-size:15px;">Use the code below to set a new password</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:24px;">
                  <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;text-align:center;">
                    Enter this code on the password reset page.<br>Expires in <strong style="color:#f59e0b;">10 minutes</strong>.
                  </p>
                </td>
              </tr>
              <!-- OTP Box -->
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <div style="display:inline-block;background:#0f172a;border:2px solid #dc2626;border-radius:16px;padding:20px 40px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Reset Code</p>
                    <p style="margin:0;font-size:42px;font-weight:700;letter-spacing:12px;color:#f87171;font-family:'Courier New',monospace;">${otp}</p>
                  </div>
                </td>
              </tr>
              <!-- Steps -->
              <tr>
                <td style="background:#0f172a;border-radius:12px;padding:20px;border:1px solid #1e293b;">
                  <p style="margin:0 0 12px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">How to reset</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${['Go back to the FleetFlow app', 'Enter this 6-digit code', 'Set your new password'].map((step, i) => `
                    <tr>
                      <td width="28" valign="top" style="padding-bottom:8px;">
                        <div style="width:22px;height:22px;background:#450a0a;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#f87171;">${i + 1}</div>
                      </td>
                      <td style="padding-bottom:8px;padding-left:10px;color:#94a3b8;font-size:13px;line-height:22px;">${step}</td>
                    </tr>`).join('')}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top:20px;">
                  <p style="margin:0;font-size:12px;color:#64748b;text-align:center;line-height:1.5;">
                    ⚠️ If you didn't request a password reset, ignore this email.<br>Never share this code with anyone.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:24px;">
            <p style="margin:0;color:#334155;font-size:12px;">© 2025 FleetFlow · Fleet Management System</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
  });
};
