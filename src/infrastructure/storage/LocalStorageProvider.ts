import type { PresignResult, StorageProvider } from './StorageProvider.js';

export class LocalStorageProvider implements StorageProvider {
  async createPresignedUpload(input: {
    key: string;
    mimeType: string;
    maxSize: number;
  }): Promise<PresignResult> {
    return {
      uploadUrl: `http://localhost:5000/api/v1/media/local-upload?key=${encodeURIComponent(input.key)}`,
      storageKey: input.key,
      cdnUrl: `/media/${input.key}`,
      headers: { 'Content-Type': input.mimeType, 'X-Max-Size': String(input.maxSize) },
    };
  }
}
