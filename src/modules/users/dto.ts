import type { User, UserRole } from '@prisma/client';
import { ROLE_TO_FRONTEND } from '../../common/constants/index.js';

export interface PublicUser {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string;
  phone: string | null;
  role: 'customer' | 'visitor' | 'advisor' | 'admin';
  backendRole: UserRole;
  title: string;
  avatar: string | null;
  avatarSeed: number;
  location: string;
  joinedAt: string;
  createdAt: string;
}

export function toPublicUser(user: User): PublicUser {
  const [first, ...rest] = user.name.split(' ');
  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName ?? first ?? user.name,
    lastName: user.lastName ?? (rest.length ? rest.join(' ') : null),
    displayName: user.displayName ?? user.name,
    email: user.email,
    phone: user.phone,
    role: ROLE_TO_FRONTEND[user.role],
    backendRole: user.role,
    title: user.title,
    avatar: user.avatar,
    avatarSeed: user.avatarSeed,
    location: user.location,
    joinedAt: user.createdAt.toISOString(),
    createdAt: user.createdAt.toISOString(),
  };
}
