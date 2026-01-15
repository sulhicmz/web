import type { StateContext } from './state-context';

export class ServerStateContext implements StateContext {
  private state: Map<string, unknown> = new Map();

  get<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    this.state.set(key, value);
  }

  update<T>(key: string, updater: (prev: T | undefined) => T): void {
    const current = this.get<T>(key);
    const next = updater(current);
    this.set(key, next);
  }

  delete(key: string): void {
    this.state.delete(key);
  }

  clear(): void {
    this.state.clear();
  }

  subscribe(_key: string, _listener: (value: unknown) => void): () => void {
    return () => {};
  }

  computed<T>(key: string, computeFn: () => T): T {
    const value = computeFn();
    this.set(key, value);
    return value;
  }
}
