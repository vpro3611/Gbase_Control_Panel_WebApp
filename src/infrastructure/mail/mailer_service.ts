import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../../config/env';

export interface MailerServiceInterface {
  sendOtpEmail(email: string, code: string, subject: string): Promise<void>;
}

export class MailerService implements MailerServiceInterface {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: config.smtpUser ? { user: config.smtpUser, pass: config.smtpPass } : undefined,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendOtpEmail(email: string, code: string, subject: string): Promise<void> {
    const targetEmail = email.trim().toLowerCase();
    const fromSender = config.smtpFrom || config.smtpUser || 'no-reply@gbasecontrolpanel.com';

    try {
      const info = await this.transporter.sendMail({
        from: `GObase Control Panel <${fromSender}>`,
        to: targetEmail,
        subject: subject,
        text: `Your verification code is: ${code}. It is valid for 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 8px;">
            <h2 style="color: #38bdf8;">GObase Control Panel Verification</h2>
            <p>Use the following 6-digit OTP code to complete your action:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4ade80; background-color: #1e293b; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #94a3b8;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
      console.log(`[MailerService] OTP email successfully sent to ${targetEmail} (Message ID: ${info.messageId})`);
    } catch (error) {
      console.error(`[MailerService] Failed to send email to ${targetEmail}:`, (error as Error).message);
      throw new Error(`Failed to send verification email to ${targetEmail}: ${(error as Error).message}`);
    }
  }
}
