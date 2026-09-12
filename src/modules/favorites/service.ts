import { prisma } from '../../database/prisma/client.js';
import { AppError } from '../../common/errors/AppError.js';
import { toVehicleDto, vehicleInclude, type VehicleRecord } from '../vehicles/mapper.js';

export class FavoriteService {
  async list(userId: string) {
    const rows = await prisma.favorite.findMany({
      where: { userId },
      include: { vehicle: { include: vehicleInclude } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({
      vehicleId: row.vehicleId,
      createdAt: row.createdAt.toISOString(),
      vehicle: toVehicleDto(row.vehicle as VehicleRecord),
    }));
  }

  async add(userId: string, vehicleId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw AppError.notFound('VEHICLE_NOT_FOUND', 'Vehicle was not found');
    try {
      await prisma.favorite.create({ data: { userId, vehicleId } });
    } catch {
      throw AppError.conflict('FAVORITE_EXISTS', 'Vehicle is already in favorites');
    }
    return { vehicleId };
  }

  async remove(userId: string, vehicleId: string) {
    await prisma.favorite.deleteMany({ where: { userId, vehicleId } });
  }
}

export const favoriteService = new FavoriteService();
