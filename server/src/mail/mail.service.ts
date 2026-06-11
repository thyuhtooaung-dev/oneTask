import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter, SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (user && pass) {
      this.transporter = createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
          user,
          pass,
        },
      });
    } else {
      this.logger.warn(
        'SMTP_USER or SMTP_PASS is not configured. Emails will not be sent.',
      );
    }
  }

  async sendWorkspaceInviteEmail(
    to: string,
    workspaceName: string,
    inviterName: string,
    inviteLink: string,
  ): Promise<SentMessageInfo | void> {
    if (!this.transporter) {
      this.logger.warn(
        `Would have sent invite email to ${to} for workspace ${workspaceName}`,
      );
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: '"oneTask" <onboarding@onetask.app>',
        to,
        subject: `You've been invited to join ${workspaceName} on oneTask`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Join your team on oneTask</h2>
            <p><strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace.</p>
            <p>oneTask is a dynamic workspace where you can collaborate and manage your tasks.</p>
            <a href="${inviteLink}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold;">
              Accept Invitation
            </a>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              If you did not expect this invitation, you can ignore this email.
            </p>
          </div>
        `,
      });
      this.logger.log(`Invite email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('Failed to send invite email', error);
    }
  }
}
