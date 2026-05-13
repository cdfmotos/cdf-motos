import { useContext } from 'react';
import { HydrateContext } from './hydrate.context';

export function useHydrate() {
  const ctx = useContext(HydrateContext);
  if (!ctx) throw new Error('useHydrate debe usarse dentro de HydrateProvider');
  return ctx;
}