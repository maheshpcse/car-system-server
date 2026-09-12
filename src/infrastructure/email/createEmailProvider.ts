import { env } from '../../config/environment.js';
import type { EmailProvider } from './EmailProvider.js';
import { AwsSesEmailProvider } from './AwsSesEmailProvider.js';
import { ConsoleEmailProvider } from './ConsoleEmailProvider.js';

export function createEmailProvider(): EmailProvider {
  if (env.EMAIL_PROVIDER === 'ses') return new AwsSesEmailProvider();
  return new ConsoleEmailProvider();
}
