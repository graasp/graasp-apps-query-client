import { UUID } from '../types';

export const buildAppDataKey = (id: UUID) => [id, 'app-data'];
export const buildAppContextKey = (id: UUID) => [id, 'context'];

export const MUTATION_KEYS = {
  DELETE_RESOURCE: 'DELETE_RESOURCE',
};
