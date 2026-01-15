export type ServiceScope = 'singleton' | 'transient';

export type ServiceFactory<T> = () => T;

export interface ServiceRegistration<T> {
  factory: ServiceFactory<T>;
  scope: ServiceScope;
}

export class DIContainer {
  private services = new Map<string, ServiceRegistration<unknown>>();
  private singletons = new Map<string, unknown>();

  register<T>(name: string, factory: ServiceFactory<T>, scope: ServiceScope = 'singleton'): void {
    this.services.set(name, { factory, scope });
  }

  resolve<T>(name: string): T {
    const registration = this.services.get(name);

    if (!registration) {
      throw new Error(`Service '${name}' not registered`);
    }

    if (registration.scope === 'singleton') {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, registration.factory());
      }
      return this.singletons.get(name) as T;
    }

    return registration.factory() as T;
  }

  has(name: string): boolean {
    return this.services.has(name);
  }

  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }
}
