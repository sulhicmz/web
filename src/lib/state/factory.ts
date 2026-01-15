import type { StateContext } from './state-context';
import { AppStateStore } from './app-state';
import { ServerStateContext } from './server-state-context';
import { ClientStateContext } from './client-state-context';

export function createAppStateStore(context?: StateContext): AppStateStore {
  return new AppStateStore(context);
}

export function createServerAppState(): AppStateStore {
  return new AppStateStore(new ServerStateContext());
}

export function createClientAppState(): AppStateStore {
  return new AppStateStore(new ClientStateContext());
}
