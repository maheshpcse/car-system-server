import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { vehicleRepository } from './repository.js';
import { vehicleService } from './service.js';
import type { VehicleQueryInput } from './vehicleQuery.js';

export async function listVehicles(req: Request, res: Response) {
  const result = await vehicleService.list(req.query as unknown as VehicleQueryInput);
  sendSuccess(res, result.items, { pagination: result.pagination });
}

export async function getVehicle(req: Request, res: Response) {
  sendSuccess(res, await vehicleService.getById(String(req.params.id)));
}

export async function getSpecifications(req: Request, res: Response) {
  sendSuccess(res, await vehicleService.specifications(String(req.params.id)));
}

export async function getFeatures(req: Request, res: Response) {
  sendSuccess(res, await vehicleService.features(String(req.params.id)));
}

export async function getVariants(req: Request, res: Response) {
  sendSuccess(res, await vehicleService.variants(String(req.params.id)));
}

export async function getColors(req: Request, res: Response) {
  sendSuccess(res, await vehicleService.colors(String(req.params.id)));
}

export async function getMedia(req: Request, res: Response) {
  sendSuccess(res, await vehicleService.media(String(req.params.id)));
}

export async function getConfigurationOptions(req: Request, res: Response) {
  sendSuccess(res, await vehicleService.configurationOptions(String(req.params.id)));
}

export async function compareVehicles(req: Request, res: Response) {
  const ids = String(req.query.ids ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  sendSuccess(res, await vehicleService.compare(ids));
}

export async function listBrands(_req: Request, res: Response) {
  sendSuccess(res, await vehicleRepository.brands());
}

export async function listCategories(_req: Request, res: Response) {
  sendSuccess(res, await vehicleRepository.categories());
}

export async function listBodyTypes(_req: Request, res: Response) {
  sendSuccess(res, [
    { id: 'sedan', label: 'Sedan' },
    { id: 'suv', label: 'SUV' },
    { id: 'crossover', label: 'Crossover' },
    { id: 'coupe', label: 'Coupé' },
    { id: 'hatchback', label: 'Hatchback' },
    { id: 'wagon', label: 'Estate' },
    { id: 'roadster', label: 'Roadster' },
    { id: 'pickup', label: 'Pickup' },
  ]);
}

export async function getFilterOptions(_req: Request, res: Response) {
  sendSuccess(res, await vehicleRepository.filterOptions());
}
