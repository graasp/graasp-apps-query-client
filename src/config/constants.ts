import { StatusCodes } from 'http-status-codes';
import { CONTEXTS } from '../types';
// React Query Configs

// time during which cache entry is never refetched
export const STALE_TIME_MILLISECONDS = 0; // default is 0 to always refetch, can increase to trade load against consistency
// time during which cache entry is still served while refetches are pending
export const CACHE_TIME_MILLISECONDS = 1000 * 60 * 5; // default is 5 min

export const SIGNED_OUT_USER = {};

export const FALLBACK_TO_PUBLIC_FOR_STATUS_CODES = [
  StatusCodes.UNAUTHORIZED,
  StatusCodes.FORBIDDEN,
];

export const THUMBNAIL_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  ORIGINAL: 'original',
};
export const DEFAULT_THUMBNAIL_SIZES = THUMBNAIL_SIZES.SMALL;

export const PERMISSION_LEVELS = {
  WRITE: 'write',
  READ: 'read',
  ADMIN: 'admin',
};
export const DEFAULT_PERMISSION = PERMISSION_LEVELS.READ;

export const DEFAULT_CONTEXT = CONTEXTS.STANDALONE;
export const DEFAULT_LANG = 'en';
export const MOCK_TOKEN = 'mock-token';
