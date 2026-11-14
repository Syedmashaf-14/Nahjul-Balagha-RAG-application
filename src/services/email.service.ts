import nodemailer, { type Transporter } from 'nodemailer';

export interface ISendOtpEmailParams {
  to: string;
  name: string;
  otp: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    const user = process.env.GMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

    if (user && pass) {
      // Gmail SMTP configuration
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: user.trim(),
          pass: pass.trim().replace(/\s+/g, ''), // Strip spaces from Google 16-char App Passwords
        },
      });
    } else {
      // Fallback development transporter
      console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not set in .env.local. Initializing fallback SMTP transport.');
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false,
        auth: user && pass ? { user, pass } : undefined,
      });
    }

    return this.transporter;
  }

  /**
   * Sends a beautifully branded verification email with the 6-digit OTP code.
   */
  public async sendOtpEmail({ to, name, otp }: ISendOtpEmailParams): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
    const user = process.env.GMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

    const fromAddress = user
      ? `"Nahj al-Balagha Platform" <${user}>`
      : '"Nahj al-Balagha Platform" <no-reply@nahjalbalagha.org>';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF9F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #18231C;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FBF9F5; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid #ECE7DE; overflow: hidden; box-shadow: 0 4px 16px rgba(20, 62, 46, 0.04);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #143E2E; padding: 36px 30px; text-align: center;">
              <!-- Arabic Calligraphy Badge -->
              <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 16px; background-color: #FFFFFF; color: #143E2E; font-size: 30px; font-weight: bold; margin-bottom: 12px;">
                ن
              </div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-family: Georgia, serif; font-weight: bold; letter-spacing: -0.5px;">
                Nahj al-Balagha
              </h1>
              <p style="margin: 6px 0 0 0; color: #C1DFC9; font-size: 13px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                Path of Eloquence • Account Verification
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-family: Georgia, serif; color: #18231C;">
                As-salāmu ‘alaykum, ${name || 'Seeker of Knowledge'}
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #58635B;">
                Thank you for joining the <strong>Nahj al-Balagha Knowledge & Contemplation Platform</strong>. To activate your account and begin your personalized learning journey, please enter the one-time verification code below:
              </p>

              <!-- OTP Highlight Box -->
              <div style="background-color: #F7F5EE; border: 2px solid #143E2E; border-radius: 16px; padding: 24px 16px; text-align: center; margin: 24px 0;">
                <span style="display: block; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #7A5835; margin-bottom: 8px;">
                  Your 6-Digit Verification Code
                </span>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #143E2E; padding-left: 10px;">
                  ${otp}
                </div>
                <span style="display: block; font-size: 12px; color: #8E877D; margin-top: 8px;">
                  ⏳ Valid for 15 minutes only
                </span>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.6; color: #58635B;">
                If you did not initiate this sign-up request, you can safely ignore this email. No account will be activated without entering this verification code.
              </p>
            </td>
          </tr>

          <!-- Footer Quote & Citation -->
          <tr>
            <td style="background-color: #FBF9F5; border-top: 1px solid #ECE7DE; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 15px; color: #143E2E; font-family: 'Amiri', 'Traditional Arabic', serif; line-height: 1.8;">
                «قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ»
              </p>
              <p style="margin: 0; font-size: 12px; font-style: italic; color: #58635B;">
                &ldquo;The worth of every person is in what they do well.&rdquo;
              </p>
              <p style="margin: 4px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8E877D;">
                Imam Ali ibn Abi Talib (AS) • Nahj al-Balagha, Saying 81
              </p>
            </td>
          </tr>
        </table>

        <!-- Subfooter -->
        <table role="presentation" width="100%" style="max-width: 540px; margin-top: 16px;">
          <tr>
            <td align="center" style="font-size: 11px; color: #8E877D; line-height: 1.5;">
              Nahj al-Balagha AI Knowledge & Learning Platform<br>
              A personalized study environment for sermons, letters, and maxims.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    if (!user || !pass) {
      console.log(`\n======================================================`);
      console.log(`⚠️ GMAIL CREDENTIALS NOT YET CONFIGURED IN .env.local`);
      console.log(`To enable live Gmail delivery, add to .env.local:`);
      console.log(`GMAIL_USER=your-email@gmail.com`);
      console.log(`GMAIL_APP_PASSWORD=your-16-character-app-password`);
      console.log(`------------------------------------------------------`);
      console.log(`📧 Simulated dispatch to: ${to}`);
      console.log(`🔐 OTP Code: ${otp}`);
      console.log(`======================================================\n`);
      return { success: true, simulated: true };
    }

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: `${otp} is your Nahj al-Balagha verification code`,
        text: `As-salāmu ‘alaykum, ${name}.\n\nYour Nahj al-Balagha account verification code is: ${otp}\n\nThis code expires in 15 minutes.\n\n"The worth of every person is in what they do well." — Saying 81`,
        html: htmlContent,
      });

      console.log(`✅ Real Gmail SMTP sent successfully to ${to}, Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId, simulated: false };
    } catch (err: any) {
      console.error('❌ Gmail SMTP Delivery Error:', err.message);
      throw new Error(`Failed to send email via Gmail SMTP: ${err.message}`);
    }
  }
}

export const emailService = new EmailService();
