// ==========================================================================
// AstroPro Digital - Client State Manager
// Manajemen state client-side dengan reactive subscriptions
// ==========================================================================

export class ClientStateManager {
  private static instance: ClientStateManager;
  private state: Map<string, any> = new Map();
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  static getInstance(): ClientStateManager {
    if (!ClientStateManager.instance) {
      ClientStateManager.instance = new ClientStateManager();
    }
    return ClientStateManager.instance;
  }

  set(key: string, value: any): void {
    this.state.set(key, value);
    this.notifyListeners(key, value);
  }

  get<T>(key: string): T | null {
    return this.state.get(key) || null;
  }

  update(key: string, updater: (prev: any) => any): void {
    const current = this.get(key);
    const next = updater(current);
    this.set(key, next);
  }

  delete(key: string): void {
    this.state.delete(key);
    this.notifyListeners(key, undefined);
  }

  clear(): void {
    this.state.clear();
    this.listeners.clear();
  }

  subscribe(key: string, listener: (value: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(listener);

    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  private notifyListeners(key: string, value: any): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => listener(value));
    }
  }

  computed<T>(key: string, computeFn: () => T): T {
    const value = computeFn();
    this.set(key, value);
    return value;
  }
}
