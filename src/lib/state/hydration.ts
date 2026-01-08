import type { StateContext } from './state-context';

export interface ServerState {
  [key: string]: unknown;
}

export function hydrateClientState(targetContext: StateContext, serverState: ServerState): void {
  Object.entries(serverState).forEach(([key, value]) => {
    targetContext.set(key, value);
  });
}

export function extractServerState(sourceContext: StateContext, keys?: string[]): ServerState {
  const state: ServerState = {};

  if (keys) {
    keys.forEach(key => {
      state[key] = sourceContext.get(key);
    });
  } else {
    const stateMap = sourceContext as unknown as { state: Map<string, unknown> };
    if (stateMap.state) {
      stateMap.state.forEach((value, key) => {
        state[key] = value;
      });
    }
  }

  return state;
}

export function createInitialStateScript(serverState: ServerState): string {
  const serialized = JSON.stringify(serverState, (_, value) => {
    if (value instanceof Map || value instanceof Set) {
      return Array.from(value.entries());
    }
    return value;
  });

  return `<script id="server-state" type="application/json">${serialized}</script>`;
}

export function parseServerStateScript(): ServerState | null {
  const script = document.getElementById('server-state');
  if (!script || script.getAttribute('type') !== 'application/json') {
    return null;
  }

  try {
    const content = script.textContent;
    return content ? JSON.parse(content) : null;
  } catch {
    return null;
  }
}
