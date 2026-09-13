export const API_PREFIX = '/api/v1';
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 100;
export const MAX_COMPARE = 3;
export const REFRESH_COOKIE = 'refreshToken';

export const FRONTEND_ROLES = ['customer', 'visitor', 'advisor', 'admin'] as const;
export type FrontendRole = (typeof FRONTEND_ROLES)[number];

export const ROLE_TO_FRONTEND = {
  CUSTOMER: 'customer',
  SHOWROOM_VISITOR: 'visitor',
  SALES_ADVISOR: 'advisor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'admin',
} as const;

export const FRONTEND_TO_ROLE = {
  customer: 'CUSTOMER',
  visitor: 'SHOWROOM_VISITOR',
  advisor: 'SALES_ADVISOR',
  admin: 'ADMIN',
} as const;

export const PERSONA_MAP = {
  customer: 'customer',
  CUSTOMER: 'customer',
  maya: 'customer',
  visitor: 'visitor',
  SHOWROOM_VISITOR: 'visitor',
  advisor: 'advisor',
  SALES_ADVISOR: 'advisor',
  daniel: 'advisor',
  admin: 'admin',
  ADMIN: 'admin',
  priya: 'admin',
} as const;

export const USERNAME_RE = /^[a-zA-Z0-9._-]{3,32}$/;

export const DEMO_USERS = [
  {
    personaId: 'customer',
    username: 'maya',
    role: 'CUSTOMER' as const,
    name: 'Maya Lindqvist',
    title: 'Customer',
    email: 'maya@demo.aurora',
    avatarSeed: 1,
    location: 'Copenhagen, DK',
  },
  {
    personaId: 'visitor',
    username: 'visitor',
    role: 'SHOWROOM_VISITOR' as const,
    name: 'Showroom Visitor',
    title: 'Showroom Visitor',
    email: 'visitor@demo.aurora',
    avatarSeed: 2,
    location: 'Copenhagen, DK',
  },
  {
    personaId: 'advisor',
    username: 'daniel',
    role: 'SALES_ADVISOR' as const,
    name: 'Daniel Okafor',
    title: 'Sales Advisor',
    email: 'daniel@demo.aurora',
    avatarSeed: 3,
    location: 'Copenhagen, DK',
  },
  {
    personaId: 'admin',
    username: 'priya',
    role: 'ADMIN' as const,
    name: 'Priya Raman',
    title: 'Admin',
    email: 'priya@demo.aurora',
    avatarSeed: 4,
    location: 'Copenhagen, DK',
  },
];

export const DEMO_NOTIFICATIONS = [
  {
    idSuffix: 'x1',
    type: 'vehicle',
    title: 'Aureon X1 Performance now available',
    body: 'A new variant has been added to the configurator.',
    href: '/cars/aureon-x1',
    kind: 'vehicle',
    read: false,
    minutesAgo: 18,
  },
  {
    idSuffix: 'showroom',
    type: 'info',
    title: 'Showroom lighting updated',
    body: 'Studio mode now supports dark environments.',
    href: '/showroom',
    kind: 'info',
    read: false,
    minutesAgo: 300,
  },
  {
    idSuffix: 'build',
    type: 'success',
    title: 'Your saved build is ready',
    body: 'Velora GT · Deep Crimson · Forged 21"',
    href: '/saved-builds',
    kind: 'success',
    read: true,
    minutesAgo: 1560,
  },
] as const;
