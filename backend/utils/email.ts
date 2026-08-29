import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const fromName = process.env.SMTP_FROM_NAME || 'Gated Marketplace';
const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;
const clientPortalUrl = process.env.CLIENT_PORTAL_URL || 'http://localhost:3001';

if (!smtpUser || !smtpPass) {
  console.warn('[Email] SMTP_USER / SMTP_PASS are not configured. Email sending will fail until these are set in backend/.env');
}

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendClientCredentialsEmail({
  recipientEmail,
  recipientName,
  username,
  temporaryPassword,
  storeName,
  ownerName,
  ownerEmail,
  assignedTier,
}: {
  recipientEmail: string;
  recipientName?: string;
  username: string;
  temporaryPassword: string;
  storeName: string;
  ownerName?: string;
  ownerEmail?: string;
  assignedTier: string;
}) {
  const subject = `Your ${storeName} Client Portal Credentials`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
      <div style="background: linear-gradient(135deg, #1e293b, #2988c8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to ${storeName}</h1>
        <p style="color: #e2e8f0; margin: 8px 0 0; font-size: 14px;">Client Portal Access Granted</p>
      </div>

      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hello ${recipientName || 'Valued Client'},</p>
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Your account has been created by <strong>${ownerName || storeName}</strong>. Below are your login credentials to access the client portal.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px;">Your Credentials</h2>
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 40%;">Portal URL</td>
              <td style="padding: 8px 0;"><a href="${clientPortalUrl}" style="color: #2988c8; text-decoration: none;">${clientPortalUrl}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Username</td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #1e293b;">${username}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Temporary Password</td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #dc2626;">${temporaryPassword}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Assigned Tier</td>
              <td style="padding: 8px 0;"><span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${assignedTier}</span></td>
            </tr>
          </table>
        </div>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 13px; color: #92400e;">
            <strong>Important:</strong> You will be required to change this temporary password on your first login.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${clientPortalUrl}" style="background: #2988c8; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            Go to Client Portal
          </a>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
          If you have any questions or need assistance, please contact <strong>${ownerName || storeName}</strong> at <a href="mailto:${ownerEmail || ''}" style="color: #2988c8;">${ownerEmail || 'support'}</a>.
        </p>
      </div>

      <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  const text = `
Welcome to ${storeName} - Client Portal Access Granted

Hello ${recipientName || 'Valued Client'},

Your account has been created by ${ownerName || storeName}. Below are your login credentials:

Portal URL: ${clientPortalUrl}
Username: ${username}
Temporary Password: ${temporaryPassword}
Assigned Tier: ${assignedTier}

IMPORTANT: You will be required to change this temporary password on your first login.

Go to Client Portal: ${clientPortalUrl}

If you have any questions or need assistance, please contact ${ownerName || storeName} at ${ownerEmail || 'support'}.

This is an automated message. Please do not reply to this email.
  `;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    replyTo: ownerEmail ? { name: ownerName, address: ownerEmail } : undefined,
    to: recipientEmail,
    subject,
    text,
    html,
  });
}
