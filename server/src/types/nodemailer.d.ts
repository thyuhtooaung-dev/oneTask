declare module 'nodemailer' {
  interface SendMailOptions {
    from?: string;
    to?: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
  }

  interface SentMessageInfo {
    messageId: string;
    accepted: string[];
    rejected: string[];
    response: string;
  }

  interface Transporter {
    sendMail(mailOptions: SendMailOptions): Promise<SentMessageInfo>;
    verify(): Promise<true>;
    close(): void;
  }

  interface TransportOptions {
    service?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }

  export function createTransport(options: TransportOptions): Transporter;
}
