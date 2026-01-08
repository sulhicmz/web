export type { StateContext } from './state-context';
export { ServerStateContext } from './server-state-context';
export { ClientStateContext } from './client-state-context';
export { ClientStateManager } from './client-state';
export { SessionManager } from './session-manager';
export { AppStateStore } from './app-state';
export { useState, useReactiveState } from './hooks';
export { createAppStateStore, createServerAppState, createClientAppState } from './factory';
export type { ServerState } from './hydration';
export { hydrateClientState, extractServerState, createInitialStateScript, parseServerStateScript } from './hydration';

import { ServerStateContext } from './server-state-context';
import { ClientStateContext } from './client-state-context';
import { ClientStateManager } from './client-state';
import { SessionManager } from './session-manager';
import { AppStateStore } from './app-state';

export const serverState = new ServerStateContext();
export const clientState = ClientStateManager.getInstance();
export const sessionManager = SessionManager.getInstance();
export const appState = new AppStateStore();
