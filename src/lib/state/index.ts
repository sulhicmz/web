// State management exports
export { ServerStateManager } from './server-state';
export { ClientStateManager } from './client-state';
export { SessionManager } from './session-manager';
export { AppStateStore } from './app-state';
export { useState, useReactiveState } from './hooks';

import { ServerStateManager } from './server-state';
import { ClientStateManager } from './client-state';
import { SessionManager } from './session-manager';
import { AppStateStore } from './app-state';

export const serverState = ServerStateManager.getInstance();
export const clientState = ClientStateManager.getInstance();
export const sessionManager = SessionManager.getInstance();
export const appState = new AppStateStore();
