import { getHydrateState } from '../db/sync/hydrateState';

export type HydrateContextValue = ReturnType<typeof getHydrateState> & {
  recargar: () => Promise<void>;
};