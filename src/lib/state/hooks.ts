// ==========================================================================
// AstroPro Digital - State Management Utilities
// Utilities untuk state management
// ==========================================================================

import { ClientStateManager } from './client-state';

export function useState<T>(key: string, initialValue: T) {
  const state = ClientStateManager.getInstance().get<T>(key) ?? initialValue;

  const setState = (value: T | ((prev: T) => T)) => {
    const clientState = ClientStateManager.getInstance();
    const current = clientState.get<T>(key) ?? initialValue;
    const newValue = typeof value === 'function' ? (value as (prev: T) => T)(current) : value;
    clientState.set(key, newValue);
  };

  return [state, setState] as const;
}

export function useReactiveState<T>(key: string, initialValue: T) {
  const clientState = ClientStateManager.getInstance();
  const state = clientState.get<T>(key) ?? initialValue;

  const setState = (value: T | ((prev: T) => T)) => {
    const current = clientState.get<T>(key) ?? initialValue;
    const newValue = typeof value === 'function' ? (value as (prev: T) => T)(current) : value;
    clientState.set(key, newValue);
  };

  const subscribe = (callback: (value: T) => void) => {
    return clientState.subscribe(key, callback);
  };

  return { state, setState, subscribe };
}
