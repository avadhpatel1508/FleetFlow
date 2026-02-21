import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
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
    await transporter.sendMail({
        from: `"FleetFlow" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your FleetFlow Verification Code',
        html: `
        <div style="${emailStyle}">
            <div style="${cardStyle}">
                <img src="https://fleet-flow-steel.vercel.app/logo.svg" alt="FleetFlow" style="height:48px;margin-bottom:24px;" />
                <h2 style="color:#fff;margin:0 0 8px;">Verify Your Account</h2>
                <p style="color:#94a3b8;margin:0 0 32px;">Enter the 6-digit code below to verify your email address. It expires in 10 minutes.</p>
                <div style="background:#0f172a;border-radius:12px;padding:24px;letter-spacing:16px;font-size:36px;font-weight:700;color:#818cf8;font-family:monospace;">${otp}</div>
                <p style="color:#64748b;font-size:13px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
        </div>`
    });
};

export const sendPasswordResetEmail = async (to, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    await transporter.sendMail({
        from: `"FleetFlow" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reset Your FleetFlow Password',
        html: `
        <div style="${emailStyle}">
            <div style="${cardStyle}">
                <img src="https://fleet-flow-steel.vercel.app/logo.svg" alt="FleetFlow" style="height:48px;margin-bottom:24px;" />
                <h2 style="color:#fff;margin:0 0 8px;">Reset Password</h2>
                <p style="color:#94a3b8;margin:0 0 32px;">Click the button below to reset your password. This link expires in 30 minutes.</p>
                <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;">Reset Password</a>
                <p style="color:#64748b;font-size:13px;margin-top:24px;">If you didn't request a password reset, please ignore this email.</p>
            </div>
        </div>`
    });
};
