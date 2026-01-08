export interface StateContext {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  update<T>(key: string, updater: (prev: T | undefined) => T): void;
  delete(key: string): void;
  clear(): void;
  subscribe(key: string, listener: (value: unknown) => void): () => void;
  computed<T>(key: string, computeFn: () => T): T;
}
