import { Router } from 'express';
import { validate } from '../../common/validation/validate.js';
import {
  compareVehicles,
  getColors,
  getConfigurationOptions,
  getFeatures,
  getMedia,
  getSpecifications,
  getVariants,
  getVehicle,
  listVehicles,
} from './controller.js';
import { compareQuerySchema, idParamSchema, vehicleQuerySchema } from './schema.js';

export const vehicleRoutes = Router();

vehicleRoutes.get('/', validate({ query: vehicleQuerySchema }), listVehicles);
vehicleRoutes.get('/compare', validate({ query: compareQuerySchema }), compareVehicles);
vehicleRoutes.get('/:id', validate({ params: idParamSchema }), getVehicle);
vehicleRoutes.get('/:id/specifications', validate({ params: idParamSchema }), getSpecifications);
vehicleRoutes.get('/:id/features', validate({ params: idParamSchema }), getFeatures);
vehicleRoutes.get('/:id/variants', validate({ params: idParamSchema }), getVariants);
vehicleRoutes.get('/:id/colors', validate({ params: idParamSchema }), getColors);
vehicleRoutes.get('/:id/media', validate({ params: idParamSchema }), getMedia);
vehicleRoutes.get('/:id/configuration-options', validate({ params: idParamSchema }), getConfigurationOptions);
