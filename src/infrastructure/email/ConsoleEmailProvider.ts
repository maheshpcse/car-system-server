import { logger } from '../../common/logging/logger.js';
import type { EmailProvider, EmailMessage } from './EmailProvider.js';

export class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    logger.info('email.console', { to: message.to, subject: message.subject });
  }
}
