import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma/client.js';
import { AppError } from '../../common/errors/AppError.js';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { validate } from '../../common/validation/validate.js';
import { createStorageProvider } from '../../infrastructure/storage/createStorageProvider.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireAdmin } from '../../middleware/authorize.js';
import { randomToken } from '../../utils/crypto.js';

const ALLOWED = new Map([
  ['image/jpeg', { ext: 'jpg', max: 8_000_000, type: 'IMAGE' as const }],
  ['image/png', { ext: 'png', max: 8_000_000, type: 'IMAGE' as const }],
  ['image/webp', { ext: 'webp', max: 8_000_000, type: 'IMAGE' as const }],
  ['model/gltf-binary', { ext: 'glb', max: 80_000_000, type: 'MODEL_3D' as const }],
  ['model/gltf+json', { ext: 'gltf', max: 80_000_000, type: 'MODEL_3D' as const }],
  ['application/octet-stream', { ext: 'bin', max: 80_000_000, type: 'MODEL_3D' as const }],
]);

const storage = createStorageProvider();

export const mediaRoutes = Router();
mediaRoutes.use(requireAuth, requireAdmin);

mediaRoutes.post(
  '/presigned-upload',
  validate({
    body: z.object({
      mimeType: z.string(),
      fileName: z.string(),
      fileSize: z.number().int().positive(),
      mediaType: z.enum(['IMAGE', 'GALLERY', 'MODEL_3D', 'TEXTURE', 'HDR', 'AVATAR', 'THUMBNAIL']).optional(),
    }),
  }),
  async (req: Request, res: Response) => {
    const allowed = ALLOWED.get(req.body.mimeType);
    if (!allowed) throw AppError.badRequest('INVALID_FILE_TYPE', 'File type is not allowed');
    if (req.body.fileSize > allowed.max) throw AppError.badRequest('FILE_TOO_LARGE', 'File exceeds the size limit');
    const key = `uploads/${new Date().getUTCFullYear()}/${randomToken(8)}.${allowed.ext}`;
    const presign = await storage.createPresignedUpload({
      key,
      mimeType: req.body.mimeType,
      maxSize: allowed.max,
    });
    const asset = await prisma.mediaAsset.create({
      data: {
        storageKey: key,
        cdnUrl: presign.cdnUrl,
        mediaType: req.body.mediaType ?? allowed.type,
        mimeType: req.body.mimeType,
        fileSize: req.body.fileSize,
        uploadedBy: req.user!.id,
      },
    });
    sendSuccess(res, { ...presign, assetId: asset.id });
  },
);

mediaRoutes.post(
  '/complete',
  validate({
    body: z.object({
      assetId: z.string(),
      vehicleId: z.string().optional(),
      displayOrder: z.number().int().optional(),
    }),
  }),
  async (req: Request, res: Response) => {
    const asset = await prisma.mediaAsset.update({
      where: { id: req.body.assetId },
      data: { status: 'ready', completedAt: new Date() },
    });
    if (req.body.vehicleId) {
      await prisma.vehicleMedia.create({
        data: {
          vehicleId: req.body.vehicleId,
          mediaType: asset.mediaType,
          storageKey: asset.storageKey,
          cdnUrl: asset.cdnUrl,
          mimeType: asset.mimeType,
          fileSize: asset.fileSize,
          displayOrder: req.body.displayOrder ?? 0,
        },
      });
    }
    sendSuccess(res, asset);
  },
);
