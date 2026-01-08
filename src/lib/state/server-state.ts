// ==========================================================================
// AstroPro Digital - Server State Manager
// Manajemen state server-side dengan TTL support
// ==========================================================================

interface StateItem<T> {
  value: T;
  timestamp: number;
  ttl: number | null;
}

export class ServerStateManager {
  private static instance: ServerStateManager;
  private state: Map<string, StateItem<unknown>> = new Map();

  static getInstance(): ServerStateManager {
    if (!ServerStateManager.instance) {
      ServerStateManager.instance = new ServerStateManager();
    }
    return ServerStateManager.instance;
  }

  set<T>(key: string, value: T): void {
    const item: StateItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: null
    };
    this.state.set(key, item as StateItem<unknown>);
  }

  get<T>(key: string): T | null {
    const item = this.state.get(key) as StateItem<T> | undefined;
    if (!item) return null;

    if (item.ttl && Date.now() > item.timestamp + item.ttl) {
      this.state.delete(key);
      return null;
    }

    return item.value;
  }

  setWithTTL<T>(key: string, value: T, ttlMs: number): void {
    const item: StateItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttlMs
    };
    this.state.set(key, item as StateItem<unknown>);
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
