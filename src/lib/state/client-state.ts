// ==========================================================================
// AstroPro Digital - Client State Manager (Deprecated)
// DEPRECATED: Use ClientStateContext instead for new code
// Manajemen state client-side dengan reactive subscriptions
// ==========================================================================

import { ClientStateContext } from './client-state-context';

export class ClientStateManager {
  private static instance: ClientStateContext;

  static getInstance(): ClientStateContext {
    if (!ClientStateManager.instance) {
      ClientStateManager.instance = new ClientStateContext();
    }
    return ClientStateManager.instance;
  }
}
