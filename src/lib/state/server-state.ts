// ==========================================================================
// AstroPro Digital - Server State Manager
// Manajemen state server-side dengan TTL support
// ==========================================================================

export class ServerStateManager {
  private static instance: ServerStateManager;
  private state: Map<string, any> = new Map();

  static getInstance(): ServerStateManager {
    if (!ServerStateManager.instance) {
      ServerStateManager.instance = new ServerStateManager();
    }
    return ServerStateManager.instance;
  }

  set(key: string, value: any): void {
    this.state.set(key, {
      value,
      timestamp: Date.now(),
      ttl: null
    });
  }

  get<T>(key: string): T | null {
    const item = this.state.get(key);
    if (!item) return null;

    if (item.ttl && Date.now() > item.timestamp + item.ttl) {
      this.state.delete(key);
      return null;
    }

    return item.value as T;
  }

  setWithTTL(key: string, value: any, ttlMs: number): void {
    this.state.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  delete(key: string): void {
    this.state.delete(key);
  }

  clear(): void {
    this.state.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}
