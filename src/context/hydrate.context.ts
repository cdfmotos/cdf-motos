import { createContext } from 'react';
import type { HydrateContextValue } from './hydrate.types';

export const HydrateContext = createContext<HydrateContextValue | null>(null);