import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { corsOptions } from '../config/cors.js';
import { errorHandler } from '../common/errors/errorHandler.js';
import { API_PREFIX } from '../common/constants/index.js';
import { requestId } from '../middleware/requestId.js';
import { requestLogger } from '../middleware/requestLogger.js';
import { apiLimiter } from '../middleware/rateLimit.js';
import { authRoutes } from '../modules/auth/routes.js';
import { userRoutes } from '../modules/users/routes.js';
import { vehicleRoutes } from '../modules/vehicles/routes.js';
import { listBodyTypes, listBrands, listCategories, getFilterOptions } from '../modules/vehicles/controller.js';
import { showroomRoutes } from '../modules/showroom/routes.js';
import { configurationRoutes } from '../modules/configurator/routes.js';
import { favoriteRoutes } from '../modules/favorites/routes.js';
import { comparisonRoutes } from '../modules/comparisons/routes.js';
import { savedBuildRoutes } from '../modules/saved-builds/routes.js';
import { notificationRoutes } from '../modules/notifications/routes.js';
import { mediaRoutes } from '../modules/media/routes.js';
import { adminRoutes } from '../modules/admin/routes.js';
import { healthRoutes } from '../modules/health/routes.js';
import { openApiDocument } from './openapi.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(requestId);
  app.use(requestLogger);
  app.use(apiLimiter);

  app.use('/health', healthRoutes);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get('/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });

  const api = express.Router();
  api.use('/auth', authRoutes);
  api.use('/users', userRoutes);
  api.use('/vehicles', vehicleRoutes);
  api.get('/brands', listBrands);
  api.get('/categories', listCategories);
  api.get('/body-types', listBodyTypes);
  api.get('/filter-options', getFilterOptions);
  api.use('/showroom', showroomRoutes);
  api.use('/configurations', configurationRoutes);
  api.use('/favorites', favoriteRoutes);
  api.use('/comparisons', comparisonRoutes);
  api.use('/saved-builds', savedBuildRoutes);
  api.use('/notifications', notificationRoutes);
  api.use('/media', mediaRoutes);
  api.use('/admin', adminRoutes);
  app.use(API_PREFIX, api);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route was not found' },
    });
  });
  app.use(errorHandler);
  return app;
}
