export interface PresignResult {
  uploadUrl: string;
  storageKey: string;
  cdnUrl: string;
  headers: Record<string, string>;
}

export interface StorageProvider {
  createPresignedUpload(input: {
    key: string;
    mimeType: string;
    maxSize: number;
  }): Promise<PresignResult>;
}
