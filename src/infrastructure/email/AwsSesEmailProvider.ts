import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { env } from '../../config/environment.js';
import type { EmailProvider, EmailMessage } from './EmailProvider.js';

export class AwsSesEmailProvider implements EmailProvider {
  private readonly client = new SESClient({ region: env.AWS_REGION });

  async send(message: EmailMessage) {
    await this.client.send(
      new SendEmailCommand({
        Source: env.AWS_SES_FROM_EMAIL,
        Destination: { ToAddresses: [message.to] },
        Message: {
          Subject: { Data: message.subject },
          Body: {
            Text: { Data: message.text },
            ...(message.html ? { Html: { Data: message.html } } : {}),
          },
        },
      }),
    );
  }
}
