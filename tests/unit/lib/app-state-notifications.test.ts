import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppStateStore } from '../../../src/lib/state/app-state';

describe('AppStateStore Notifications', () => {
  let store: AppStateStore;

  beforeEach(() => {
    store = new AppStateStore();
  });

  afterEach(() => {
    store.reset();
  });

  describe('notifications getter/setter', () => {
    it('should return empty array by default', () => {
      expect(store.notifications).toEqual([]);
    });

    it('should set and retrieve notifications', () => {
      const notifications = [
        { id: '1', message: 'Test', type: 'info' as const, isRead: false, timestamp: '2024-01-01' },
        { id: '2', message: 'Test 2', type: 'success' as const, isRead: true, timestamp: '2024-01-02' }
      ];
      store.notifications = notifications;

      expect(store.notifications).toEqual(notifications);
    });

    it('should handle single notification', () => {
      const notification = {
        id: '1',
        message: 'Single notification',
        type: 'info' as const,
        isRead: false,
        timestamp: '2024-01-01'
      };
      store.notifications = [notification];

      expect(store.notifications).toEqual([notification]);
    });

    it('should replace existing notifications', () => {
      store.notifications = [{ id: '1', message: 'Old', type: 'info' as const, isRead: false, timestamp: '2024-01-01' }];
      store.notifications = [{ id: '2', message: 'New', type: 'success' as const, isRead: false, timestamp: '2024-01-02' }];

      expect(store.notifications).toHaveLength(1);
      expect(store.notifications[0].id).toBe('2');
    });
  });

  describe('unreadCount computed property', () => {
    it('should return 0 when no notifications', () => {
      expect(store.unreadCount).toBe(0);
    });

    it('should return 0 when all notifications are read', () => {
      store.notifications = [
        { id: '1', message: 'Read 1', type: 'info' as const, isRead: true, timestamp: '2024-01-01' },
        { id: '2', message: 'Read 2', type: 'success' as const, isRead: true, timestamp: '2024-01-02' }
      ];

      expect(store.unreadCount).toBe(0);
    });

    it('should return count of unread notifications', () => {
      store.notifications = [
        { id: '1', message: 'Unread 1', type: 'info' as const, isRead: false, timestamp: '2024-01-01' },
        { id: '2', message: 'Read 2', type: 'success' as const, isRead: true, timestamp: '2024-01-02' },
        { id: '3', message: 'Unread 3', type: 'error' as const, isRead: false, timestamp: '2024-01-03' }
      ];

      expect(store.unreadCount).toBe(2);
    });

    it('should return count when all notifications are unread', () => {
      store.notifications = [
        { id: '1', message: 'Unread 1', type: 'info' as const, isRead: false, timestamp: '2024-01-01' },
        { id: '2', message: 'Unread 2', type: 'success' as const, isRead: false, timestamp: '2024-01-02' },
        { id: '3', message: 'Unread 3', type: 'error' as const, isRead: false, timestamp: '2024-01-03' }
      ];

      expect(store.unreadCount).toBe(3);
    });

    it('should dynamically update when notifications change', () => {
      store.notifications = [
        { id: '1', message: 'Test', type: 'info', isRead: false, timestamp: '2024-01-01' }
      ];

      expect(store.unreadCount).toBe(1);

      store.notifications[0].isRead = true;

      expect(store.unreadCount).toBe(0);
    });
  });

  describe('notification types', () => {
    it('should handle success type', () => {
      store.notifications = [
        { id: '1', message: 'Success', type: 'success' as const, isRead: false, timestamp: '2024-01-01' }
      ];

      expect(store.notifications[0].type).toBe('success');
    });

    it('should handle error type', () => {
      store.notifications = [
        { id: '1', message: 'Error', type: 'error' as const, isRead: false, timestamp: '2024-01-01' }
      ];

      expect(store.notifications[0].type).toBe('error');
    });

    it('should handle warning type', () => {
      store.notifications = [
        { id: '1', message: 'Warning', type: 'warning' as const, isRead: false, timestamp: '2024-01-01' }
      ];

      expect(store.notifications[0].type).toBe('warning');
    });

    it('should handle info type', () => {
      store.notifications = [
        { id: '1', message: 'Info', type: 'info' as const, isRead: false, timestamp: '2024-01-01' }
      ];

      expect(store.notifications[0].type).toBe('info');
    });
  });

  describe('notification management scenarios', () => {
    it('should handle adding new notification', () => {
      const initial = [
        { id: '1', message: 'Initial', type: 'info' as const, isRead: false, timestamp: '2024-01-01' }
      ];
      store.notifications = initial;

      const updated = [
        ...initial,
        { id: '2', message: 'New', type: 'success' as const, isRead: false, timestamp: '2024-01-02' }
      ];
      store.notifications = updated;

      expect(store.notifications).toHaveLength(2);
      expect(store.unreadCount).toBe(2);
    });

    it('should handle marking notification as read', () => {
      store.notifications = [
        { id: '1', message: 'Test', type: 'info', isRead: false, timestamp: '2024-01-01' }
      ];

      store.notifications[0].isRead = true;

      expect(store.unreadCount).toBe(0);
    });

    it('should handle deleting notifications', () => {
      store.notifications = [
        { id: '1', message: 'Keep', type: 'info' as const, isRead: false, timestamp: '2024-01-01' },
        { id: '2', message: 'Delete', type: 'error' as const, isRead: false, timestamp: '2024-01-02' },
        { id: '3', message: 'Keep', type: 'success' as const, isRead: false, timestamp: '2024-01-03' }
      ];

      store.notifications = store.notifications.filter(n => n.id !== '2');

      expect(store.notifications).toHaveLength(2);
      expect(store.notifications.find(n => n.id === '2')).toBeUndefined();
    });

    it('should handle clearing all notifications', () => {
      store.notifications = [
        { id: '1', message: 'Test 1', type: 'info' as const, isRead: false, timestamp: '2024-01-01' },
        { id: '2', message: 'Test 2', type: 'error' as const, isRead: false, timestamp: '2024-01-02' }
      ];

      store.notifications = [];

      expect(store.notifications).toEqual([]);
      expect(store.unreadCount).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle large number of notifications', () => {
      const types = ['success', 'error', 'warning', 'info'] as const;
      const notifications = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        message: `Notification ${i}`,
        type: types[i % 4],
        isRead: i % 2 === 0,
        timestamp: `2024-01-${(i % 30) + 1}`
      }));

      store.notifications = notifications;

      expect(store.notifications).toHaveLength(1000);
      expect(store.unreadCount).toBe(500);
    });

    it('should handle notifications with special characters in message', () => {
      const notifications = [
        { id: '1', message: 'Message with <script>alert("xss")</script>', type: 'info' as const, isRead: false, timestamp: '2024-01-01' },
        { id: '2', message: 'Message with "quotes" and \'apostrophes\'', type: 'error' as const, isRead: false, timestamp: '2024-01-02' },
        { id: '3', message: 'Message with emojis 🎉✅❌⚠️', type: 'success' as const, isRead: false, timestamp: '2024-01-03' }
      ];

      store.notifications = notifications;

      expect(store.notifications).toHaveLength(3);
      expect(store.notifications[0].message).toContain('<script>');
      expect(store.notifications[2].message).toContain('🎉');
    });

    it('should handle empty notification message', () => {
      store.notifications = [
        { id: '1', message: '', type: 'info' as const, isRead: false, timestamp: '2024-01-01' }
      ];

      expect(store.notifications[0].message).toBe('');
    });

    it('should handle duplicate notification IDs', () => {
      const notifications = [
        { id: '1', message: 'First', type: 'info' as const, isRead: false, timestamp: '2024-01-01' },
        { id: '1', message: 'Duplicate', type: 'error' as const, isRead: false, timestamp: '2024-01-02' }
      ];

      store.notifications = notifications;

      expect(store.notifications).toHaveLength(2);
    });
  });
});
