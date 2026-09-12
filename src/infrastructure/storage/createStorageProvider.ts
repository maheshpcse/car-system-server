import { env } from '../../config/environment.js';
import { LocalStorageProvider } from './LocalStorageProvider.js';
import { S3StorageProvider } from './S3StorageProvider.js';
import type { StorageProvider } from './StorageProvider.js';

export function createStorageProvider(): StorageProvider {
  if (env.STORAGE_PROVIDER === 's3') return new S3StorageProvider();
  return new LocalStorageProvider();
}
