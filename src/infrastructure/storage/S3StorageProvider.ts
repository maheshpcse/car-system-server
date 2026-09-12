import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/environment.js';
import { AppError } from '../../common/errors/AppError.js';
import type { PresignResult, StorageProvider } from './StorageProvider.js';

export class S3StorageProvider implements StorageProvider {
  private readonly client = new S3Client({ region: env.AWS_REGION });

  async createPresignedUpload(input: {
    key: string;
    mimeType: string;
    maxSize: number;
  }): Promise<PresignResult> {
    if (!env.AWS_S3_BUCKET) {
      throw AppError.badRequest('STORAGE_NOT_CONFIGURED', 'S3 bucket is not configured');
    }
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: input.key,
      ContentType: input.mimeType,
      CacheControl: 'public, max-age=31536000, immutable',
    });
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 900 });
    const host = env.AWS_CLOUDFRONT_DOMAIN
      ? `https://${env.AWS_CLOUDFRONT_DOMAIN.replace(/^https?:\/\//, '')}`
      : `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`;
    return {
      uploadUrl,
      storageKey: input.key,
      cdnUrl: `${host}/${input.key}`,
      headers: { 'Content-Type': input.mimeType },
    };
  }
}
