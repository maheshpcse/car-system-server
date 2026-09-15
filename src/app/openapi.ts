export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Aurora Motors API',
    version: '1.0.0',
    description:
      'Backend for the existing Aurora Motors React frontend (https://github.com/maheshpcse/car-system). Response models follow the frontend TypeScript contracts.',
  },
  servers: [{ url: '/api/v1', description: 'Version 1' }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Vehicles' },
    { name: 'Showroom' },
    { name: 'Configurator' },
    { name: 'Favorites' },
    { name: 'Comparisons' },
    { name: 'Saved Builds' },
    { name: 'Navigation' },
    { name: 'Notifications' },
    { name: 'Media' },
    { name: 'Admin' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              requestId: { type: 'string' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Create an account with username + email',
        responses: { '201': { description: 'Created' }, '409': { description: 'USERNAME_IN_USE or EMAIL_IN_USE' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Username or email login',
        responses: { '200': { description: 'OK' }, '401': { description: 'INVALID_CREDENTIALS' } },
      },
    },
    '/auth/demo-login': {
      post: {
        tags: ['Auth'],
        summary: 'Deterministic demo persona login',
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { persona: { type: 'string' } } } } },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/auth/logout': { post: { tags: ['Auth'], summary: 'Logout and revoke refresh cookie' } },
    '/auth/refresh': { post: { tags: ['Auth'], summary: 'Rotate refresh cookie and issue a new access token' } },
    '/auth/forgot-password': { post: { tags: ['Auth'], summary: 'Request a password reset email' } },
    '/auth/reset-password': { post: { tags: ['Auth'], summary: 'Reset password with emailed token' } },
    '/auth/me': { get: { tags: ['Auth'], summary: 'Current session user', security: [{ bearerAuth: [] }] } },
    '/users/me': { get: { tags: ['Users'], security: [{ bearerAuth: [] }] }, patch: { tags: ['Users'], security: [{ bearerAuth: [] }] } },
    '/users/me/password': { patch: { tags: ['Users'], security: [{ bearerAuth: [] }] } },
    '/users/me/preferences': {
      get: { tags: ['Users'], security: [{ bearerAuth: [] }] },
      patch: { tags: ['Users'], security: [{ bearerAuth: [] }] },
    },
    '/vehicles': {
      get: {
        tags: ['Vehicles'],
        summary: 'Search, filter, sort and paginate vehicles',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'bodyType', in: 'query', schema: { type: 'string' } },
          { name: 'fuelType', in: 'query', schema: { type: 'string' } },
          { name: 'transmission', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'minPower', in: 'query', schema: { type: 'number' } },
          { name: 'minRange', in: 'query', schema: { type: 'number' } },
          { name: 'seats', in: 'query', schema: { type: 'number' } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
      },
    },
    '/vehicles/compare': { get: { tags: ['Vehicles'], summary: 'Normalize comparison rows for ids=a,b,c' } },
    '/vehicles/{id}': { get: { tags: ['Vehicles'] } },
    '/vehicles/{id}/specifications': { get: { tags: ['Vehicles'] } },
    '/vehicles/{id}/features': { get: { tags: ['Vehicles'] } },
    '/vehicles/{id}/variants': { get: { tags: ['Vehicles'] } },
    '/vehicles/{id}/colors': { get: { tags: ['Vehicles'] } },
    '/vehicles/{id}/media': { get: { tags: ['Vehicles'] } },
    '/vehicles/{id}/configuration-options': { get: { tags: ['Configurator'] } },
    '/brands': { get: { tags: ['Vehicles'] } },
    '/categories': { get: { tags: ['Vehicles'] } },
    '/body-types': { get: { tags: ['Vehicles'] } },
    '/filter-options': { get: { tags: ['Vehicles'] } },
    '/showroom': { get: { tags: ['Showroom'] } },
    '/showroom/featured': { get: { tags: ['Showroom'] } },
    '/showroom/vehicles': { get: { tags: ['Showroom'] } },
    '/showroom/sessions': { post: { tags: ['Showroom'] } },
    '/configurations': { post: { tags: ['Configurator'], summary: 'Persist a configuration with server-side pricing' } },
    '/configurations/{id}': {
      get: { tags: ['Configurator'] },
      patch: { tags: ['Configurator'] },
      delete: { tags: ['Configurator'] },
    },
    '/favorites': { get: { tags: ['Favorites'], security: [{ bearerAuth: [] }] } },
    '/favorites/{vehicleId}': {
      post: { tags: ['Favorites'], security: [{ bearerAuth: [] }] },
      delete: { tags: ['Favorites'], security: [{ bearerAuth: [] }] },
    },
    '/comparisons': { post: { tags: ['Comparisons'] } },
    '/comparisons/{id}': {
      get: { tags: ['Comparisons'] },
      patch: { tags: ['Comparisons'] },
      delete: { tags: ['Comparisons'] },
    },
    '/saved-builds': { get: { tags: ['Saved Builds'], security: [{ bearerAuth: [] }] }, post: { tags: ['Saved Builds'] } },
    '/saved-builds/{id}': {
      get: { tags: ['Saved Builds'] },
      patch: { tags: ['Saved Builds'] },
      delete: { tags: ['Saved Builds'] },
    },
    '/navigation': {
      get: {
        tags: ['Navigation'],
        summary: 'Sidebar groups (includes Notifications)',
        responses: { '200': { description: '{ groups: NavGroup[] }' } },
      },
    },
    '/notifications': {
      get: { tags: ['Notifications'], security: [{ bearerAuth: [] }], summary: 'List AppNotification[]' },
      delete: { tags: ['Notifications'], security: [{ bearerAuth: [] }], summary: 'Clear all notifications' },
    },
    '/notifications/unread-count': {
      get: { tags: ['Notifications'], security: [{ bearerAuth: [] }], summary: '{ count }' },
    },
    '/notifications/read-all': {
      post: { tags: ['Notifications'], security: [{ bearerAuth: [] }] },
      patch: { tags: ['Notifications'], security: [{ bearerAuth: [] }] },
    },
    '/notifications/push-subscribe': {
      post: {
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        summary: 'Store a Web Push subscription',
      },
    },
    '/notifications/{id}': {
      delete: { tags: ['Notifications'], security: [{ bearerAuth: [] }] },
    },
    '/notifications/{id}/read': {
      post: { tags: ['Notifications'], security: [{ bearerAuth: [] }] },
      patch: { tags: ['Notifications'], security: [{ bearerAuth: [] }] },
    },
    '/media/presigned-upload': { post: { tags: ['Media'], security: [{ bearerAuth: [] }] } },
    '/media/complete': { post: { tags: ['Media'], security: [{ bearerAuth: [] }] } },
    '/admin/vehicles': { get: { tags: ['Admin'] }, post: { tags: ['Admin'] } },
    '/admin/vehicles/{id}': { patch: { tags: ['Admin'] }, delete: { tags: ['Admin'] } },
  },
} as const;
