import { AppError } from '../../common/errors/AppError.js';
import { paginationMeta, parsePagination } from '../../utils/pagination.js';
import type { VehicleQueryInput } from './vehicleQuery.js';
import { vehicleRepository } from './repository.js';
import { toConfigurationCatalog } from './mapper.js';

export class VehicleService {
  async list(query: VehicleQueryInput) {
    const { page, limit } = parsePagination(query.page, query.limit);
    const { total, items } = await vehicleRepository.list({ ...query, page, limit });
    return { items, pagination: paginationMeta(page, limit, total) };
  }

  async getById(id: string) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) throw AppError.notFound('VEHICLE_NOT_FOUND', 'Vehicle was not found');
    return vehicle;
  }

  async specifications(id: string) {
    const vehicle = await this.getById(id);
    return {
      power: vehicle.power,
      torque: vehicle.torque,
      topSpeed: vehicle.topSpeed,
      acceleration: vehicle.acceleration,
      range: vehicle.range,
      mileage: vehicle.mileage,
      seats: vehicle.seats,
      dimensions: vehicle.dimensions,
    };
  }

  async features(id: string) {
    const vehicle = await this.getById(id);
    return { features: vehicle.features, technology: vehicle.technology, safety: vehicle.safety };
  }

  async variants(id: string) {
    return (await this.getById(id)).variants;
  }

  async colors(id: string) {
    return (await this.getById(id)).colors;
  }

  async media(id: string) {
    const vehicle = await this.getById(id);
    return {
      renderMode: vehicle.renderMode,
      renderConfig: vehicle.renderConfig,
      model3d: vehicle.model3d,
      modelUrl: vehicle.modelUrl,
      thumbnail: vehicle.thumbnail,
    };
  }

  async configurationOptions(id: string) {
    const vehicle = await this.getById(id);
    return toConfigurationCatalog(vehicle);
  }

  async compare(ids: string[]) {
    const unique = [...new Set(ids)].slice(0, 4);
    const vehicles = await vehicleRepository.findManyByIds(unique);
    return {
      vehicles,
      groups: [
        { group: 'Price', rows: vehicles.map((v) => ({ id: v.id, value: v.price, unit: v.currency })) },
        { group: 'Performance', rows: vehicles.map((v) => ({ id: v.id, value: v.acceleration, unit: 's' })) },
        { group: 'Power', rows: vehicles.map((v) => ({ id: v.id, value: v.power, unit: 'hp' })) },
        { group: 'Torque', rows: vehicles.map((v) => ({ id: v.id, value: v.torque, unit: 'Nm' })) },
        { group: 'Range', rows: vehicles.map((v) => ({ id: v.id, value: v.range, unit: 'km' })) },
        { group: 'Acceleration', rows: vehicles.map((v) => ({ id: v.id, value: v.acceleration, unit: 's' })) },
        { group: 'Top Speed', rows: vehicles.map((v) => ({ id: v.id, value: v.topSpeed, unit: 'km/h' })) },
        { group: 'Dimensions', rows: vehicles.map((v) => ({ id: v.id, value: v.dimensions })) },
        { group: 'Seats', rows: vehicles.map((v) => ({ id: v.id, value: v.seats })) },
        { group: 'Powertrain', rows: vehicles.map((v) => ({ id: v.id, value: v.fuelType })) },
        { group: 'Technology', rows: vehicles.map((v) => ({ id: v.id, value: v.technology })) },
        { group: 'Safety', rows: vehicles.map((v) => ({ id: v.id, value: v.safety })) },
      ],
    };
  }
}

export const vehicleService = new VehicleService();
