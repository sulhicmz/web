import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { hydrateClientState, extractServerState, createInitialStateScript, parseServerStateScript } from '../../../src/lib/state/hydration';
import { ClientStateContext } from '../../../src/lib/state/client-state-context';

describe('Hydration Utilities', () => {
  describe('hydrateClientState', () => {
    let clientContext: ClientStateContext;

    beforeEach(() => {
      clientContext = new ClientStateContext();
      clientContext.clear();
    });

    it('should hydrate client context with server state', () => {
      const serverState = {
        currentUser: { id: '123', email: 'test@example.com' },
        theme: 'dark',
        sidebarOpen: true
      };

      hydrateClientState(clientContext, serverState);

      expect(clientContext.get('currentUser')).toEqual(serverState.currentUser);
      expect(clientContext.get('theme')).toBe('dark');
      expect(clientContext.get('sidebarOpen')).toBe(true);
    });

    it('should handle empty server state', () => {
      const serverState = {};

      hydrateClientState(clientContext, serverState);

      expect(clientContext.get('anything')).toBeUndefined();
    });

    it('should overwrite existing client state', () => {
      clientContext.set('key', 'oldValue');
      const serverState = { key: 'newValue' };

      hydrateClientState(clientContext, serverState);

      expect(clientContext.get('key')).toBe('newValue');
    });

    it('should preserve existing client state not in server state', () => {
      clientContext.set('clientOnly', 'preserved');
      const serverState = { serverKey: 'serverValue' };

      hydrateClientState(clientContext, serverState);

      expect(clientContext.get('clientOnly')).toBe('preserved');
      expect(clientContext.get('serverKey')).toBe('serverValue');
    });

    it('should handle complex nested objects', () => {
      const serverState = {
        nested: {
          deeply: {
            value: 'deep',
            array: [1, 2, 3]
          }
        }
      };

      hydrateClientState(clientContext, serverState);

      const result = clientContext.get('nested');
      expect(result).toEqual(serverState.nested);
    });

    it('should handle arrays', () => {
      const serverState = {
        items: [1, 2, 3, 4, 5],
        names: ['Alice', 'Bob', 'Charlie']
      };

      hydrateClientState(clientContext, serverState);

      expect(clientContext.get('items')).toEqual([1, 2, 3, 4, 5]);
      expect(clientContext.get('names')).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('should handle null values', () => {
      const serverState = {
        nullable: null,
        notNull: 'value'
      };

      hydrateClientState(clientContext, serverState);

      expect(clientContext.get('nullable')).toBeNull();
      expect(clientContext.get('notNull')).toBe('value');
    });

    it('should handle special characters in keys', () => {
      const serverState = {
        'key with spaces': 'value1',
        'key-with-dashes': 'value2',
        'key_with_underscores': 'value3'
      };

      hydrateClientState(clientContext, serverState);

      expect(clientContext.get('key with spaces')).toBe('value1');
      expect(clientContext.get('key-with-dashes')).toBe('value2');
      expect(clientContext.get('key_with_underscores')).toBe('value3');
    });
  });

  describe('extractServerState', () => {
    let serverContext: ClientStateContext;

    beforeEach(() => {
      serverContext = new ClientStateContext();
      serverContext.clear();
    });

    it('should extract all state when no keys provided', () => {
      serverContext.set('key1', 'value1');
      serverContext.set('key2', 'value2');
      serverContext.set('key3', 'value3');

      const extracted = extractServerState(serverContext);

      expect(extracted).toEqual({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3'
      });
    });

    it('should extract specific keys when keys array provided', () => {
      serverContext.set('key1', 'value1');
      serverContext.set('key2', 'value2');
      serverContext.set('key3', 'value3');
      serverContext.set('key4', 'value4');

      const extracted = extractServerState(serverContext, ['key1', 'key3']);

      expect(extracted).toEqual({
        key1: 'value1',
        key3: 'value3'
      });
    });

    it('should return empty object when context is empty', () => {
      const extracted = extractServerState(serverContext);

      expect(extracted).toEqual({});
    });

    it('should handle non-existent keys gracefully', () => {
      serverContext.set('existing', 'value');

      const extracted = extractServerState(serverContext, ['existing', 'nonexistent']);

      expect(extracted).toEqual({
        existing: 'value',
        nonexistent: undefined
      });
    });

    it('should handle complex objects', () => {
      const complexObject = {
        user: { id: 123, name: 'John' },
        settings: { theme: 'dark', notifications: true }
      };
      serverContext.set('complex', complexObject);

      const extracted = extractServerState(serverContext);

      expect(extracted.complex).toEqual(complexObject);
    });

    it('should handle arrays', () => {
      const array = [1, 2, 3, 4, 5];
      serverContext.set('array', array);

      const extracted = extractServerState(serverContext);

      expect(extracted.array).toEqual(array);
    });

    it('should handle null and undefined values', () => {
      serverContext.set('nullValue', null);
      serverContext.set('undefinedValue', undefined);

      const extracted = extractServerState(serverContext);

      expect(extracted.nullValue).toBeNull();
      expect(extracted.undefinedValue).toBeUndefined();
    });
  });

  describe('createInitialStateScript', () => {
    it('should create script tag with serialized state', () => {
      const serverState = {
        currentUser: { id: '123', email: 'test@example.com' },
        theme: 'dark'
      };

      const script = createInitialStateScript(serverState);

      expect(script).toContain('<script id="server-state"');
      expect(script).toContain('type="application/json"');
      expect(script).toContain('"currentUser"');
      expect(script).toContain('"test@example.com"');
      expect(script).toContain('"dark"');
      expect(script).toContain('</script>');
    });

    it('should handle empty state', () => {
      const script = createInitialStateScript({});

      expect(script).toContain('<script id="server-state"');
      expect(script).toContain('{}');
      expect(script).toContain('</script>');
    });

    it('should serialize Maps and Sets as arrays', () => {
      const map = new Map([['key1', 'value1'], ['key2', 'value2']]);
      const set = new Set([1, 2, 3]);

      const serverState = {
        myMap: map,
        mySet: set
      };

      const script = createInitialStateScript(serverState);

      expect(script).toContain('[["key1","value1"],["key2","value2"]]');
      expect(script).toContain('[1,1]');
    });

    it('should handle special characters in values', () => {
      const serverState = {
        html: '<div class="test">Content</div>',
        quotes: 'He said "Hello" and \'Goodbye\'',
        unicode: 'Hello 世界 🎉'
      };

      const script = createInitialStateScript(serverState);

      expect(script).toContain('test');
      expect(script).toContain('Content');
      expect(script).toContain('Hello');
      expect(script).toContain('世界');
      expect(script).toContain('🎉');
    });

    it('should handle nested structures', () => {
      const serverState = {
        level1: {
          level2: {
            level3: {
              value: 'deeply nested'
            }
          }
        }
      };

      const script = createInitialStateScript(serverState);

      expect(script).toContain('level1');
      expect(script).toContain('level2');
      expect(script).toContain('level3');
      expect(script).toContain('deeply nested');
    });

    it('should handle arrays of objects', () => {
      const serverState = {
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
          { id: 3, name: 'Charlie' }
        ]
      };

      const script = createInitialStateScript(serverState);

      expect(script).toContain('Alice');
      expect(script).toContain('Bob');
      expect(script).toContain('Charlie');
    });
  });

  describe('parseServerStateScript', () => {
    let originalDocument: Document;
    let mockDocument: Document;

    beforeEach(() => {
      originalDocument = global.document;
      mockDocument = document.implementation.createHTMLDocument('test');
      global.document = mockDocument;
    });

    afterEach(() => {
      global.document = originalDocument;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should parse valid script tag', () => {
      const script = mockDocument.createElement('script');
      script.id = 'server-state';
      script.type = 'application/json';
      script.textContent = JSON.stringify({
        currentUser: { id: '123', email: 'test@example.com' },
        theme: 'dark'
      });
      mockDocument.body.appendChild(script);

      const parsed = parseServerStateScript();

      expect(parsed).toEqual({
        currentUser: { id: '123', email: 'test@example.com' },
        theme: 'dark'
      });
    });

    it('should return null when script tag not found', () => {
      const parsed = parseServerStateScript();

      expect(parsed).toBeNull();
    });

    it('should return null when script type is not application/json', () => {
      const script = mockDocument.createElement('script');
      script.id = 'server-state';
      script.type = 'text/javascript';
      script.textContent = '{}';
      mockDocument.body.appendChild(script);

      const parsed = parseServerStateScript();

      expect(parsed).toBeNull();
    });

    it('should return null when script has invalid JSON', () => {
      const script = mockDocument.createElement('script');
      script.id = 'server-state';
      script.type = 'application/json';
      script.textContent = '{ invalid json }';
      mockDocument.body.appendChild(script);

      const parsed = parseServerStateScript();

      expect(parsed).toBeNull();
    });

    it('should return null when script content is empty', () => {
      const script = mockDocument.createElement('script');
      script.id = 'server-state';
      script.type = 'application/json';
      script.textContent = '';
      mockDocument.body.appendChild(script);

      const parsed = parseServerStateScript();

      expect(parsed).toBeNull();
    });

    it('should handle complex JSON structures', () => {
      const complexState = {
        user: { id: 123, profile: { name: 'John', age: 30 } },
        items: [1, 2, { nested: 'value' }],
        settings: { theme: 'dark', notifications: true }
      };

      const script = mockDocument.createElement('script');
      script.id = 'server-state';
      script.type = 'application/json';
      script.textContent = JSON.stringify(complexState);
      mockDocument.body.appendChild(script);

      const parsed = parseServerStateScript();

      expect(parsed).toEqual(complexState);
    });

    it('should handle null and undefined values in JSON', () => {
      const script = mockDocument.createElement('script');
      script.id = 'server-state';
      script.type = 'application/json';
      script.textContent = JSON.stringify({
        nullValue: null,
        value: 'present'
      });
      mockDocument.body.appendChild(script);

      const parsed = parseServerStateScript();

      expect(parsed?.nullValue).toBeNull();
      expect(parsed?.value).toBe('present');
    });
  });

  describe('Integration', () => {
    it('should complete full hydration cycle', () => {
      const clientContext = new ClientStateContext();
      const serverContext = new ClientStateContext();

      serverContext.set('user', { id: '123', name: 'Alice' });
      serverContext.set('theme', 'dark');

      const serverState = extractServerState(serverContext);
      const script = createInitialStateScript(serverState);

      const mockDocument = document.implementation.createHTMLDocument('test');
      const scriptElement = mockDocument.createElement('script');
      scriptElement.id = 'server-state';
      scriptElement.type = 'application/json';
      scriptElement.textContent = JSON.stringify(serverState);
      mockDocument.body.appendChild(scriptElement);

      const originalDocument = global.document;
      global.document = mockDocument;

      const parsedState = parseServerStateScript();
      if (parsedState) {
        hydrateClientState(clientContext, parsedState);
      }

      global.document = originalDocument;

      expect(clientContext.get('user')).toEqual({ id: '123', name: 'Alice' });
      expect(clientContext.get('theme')).toBe('dark');
    });

    it('should handle selective state transfer', () => {
      const clientContext = new ClientStateContext();
      const serverContext = new ClientStateContext();

      serverContext.set('user', { id: '123' });
      serverContext.set('theme', 'dark');
      serverContext.set('sidebar', true);
      serverContext.set('language', 'en');

      const serverState = extractServerState(serverContext, ['user', 'theme']);

      hydrateClientState(clientContext, serverState);

      expect(clientContext.get('user')).toEqual({ id: '123' });
      expect(clientContext.get('theme')).toBe('dark');
      expect(clientContext.get('sidebar')).toBeUndefined();
      expect(clientContext.get('language')).toBeUndefined();
    });
  });
});
