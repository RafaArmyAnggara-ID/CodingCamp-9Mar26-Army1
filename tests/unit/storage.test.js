/**
 * Unit tests for StorageManager
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import StorageManager from '../../utils/storage.js';

describe('StorageManager', () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    StorageManager.inMemoryStorage = {};
    StorageManager.storageAvailable = null;
  });

  afterEach(() => {
    localStorage.clear();
    StorageManager.inMemoryStorage = {};
    StorageManager.storageAvailable = null;
  });

  describe('isAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(StorageManager.isAvailable()).toBe(true);
    });

    it('should cache availability check result', () => {
      const firstCheck = StorageManager.isAvailable();
      const secondCheck = StorageManager.isAvailable();
      expect(firstCheck).toBe(secondCheck);
    });

    it('should return false when localStorage throws error', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('Storage disabled');
      };

      StorageManager.storageAvailable = null;
      expect(StorageManager.isAvailable()).toBe(false);

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('get', () => {
    it('should return stored value', () => {
      StorageManager.set('test_key', 'test_value');
      expect(StorageManager.get('test_key')).toBe('test_value');
    });

    it('should return default value when key does not exist', () => {
      expect(StorageManager.get('nonexistent', 'default')).toBe('default');
    });

    it('should return null when key does not exist and no default provided', () => {
      expect(StorageManager.get('nonexistent')).toBe(null);
    });

    it('should handle objects correctly', () => {
      const obj = { name: 'test', value: 123 };
      StorageManager.set('test_obj', obj);
      expect(StorageManager.get('test_obj')).toEqual(obj);
    });

    it('should handle arrays correctly', () => {
      const arr = [1, 2, 3, 'test'];
      StorageManager.set('test_arr', arr);
      expect(StorageManager.get('test_arr')).toEqual(arr);
    });

    it('should return default value for corrupted JSON data', () => {
      localStorage.setItem('corrupted', '{invalid json}');
      expect(StorageManager.get('corrupted', 'default')).toBe('default');
    });

    it('should clear corrupted data', () => {
      localStorage.setItem('corrupted', '{invalid json}');
      StorageManager.get('corrupted', 'default');
      expect(localStorage.getItem('corrupted')).toBe(null);
    });
  });

  describe('set', () => {
    it('should store string values', () => {
      const result = StorageManager.set('test', 'value');
      expect(result).toBe(true);
      expect(localStorage.getItem('test')).toBe('"value"');
    });

    it('should store number values', () => {
      const result = StorageManager.set('test', 42);
      expect(result).toBe(true);
      expect(StorageManager.get('test')).toBe(42);
    });

    it('should store boolean values', () => {
      const result = StorageManager.set('test', true);
      expect(result).toBe(true);
      expect(StorageManager.get('test')).toBe(true);
    });

    it('should store object values', () => {
      const obj = { a: 1, b: 'test' };
      const result = StorageManager.set('test', obj);
      expect(result).toBe(true);
      expect(StorageManager.get('test')).toEqual(obj);
    });

    it('should return false on quota exceeded error', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      };

      const result = StorageManager.set('test', 'value');
      expect(result).toBe(false);

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('remove', () => {
    it('should remove existing key', () => {
      StorageManager.set('test', 'value');
      const result = StorageManager.remove('test');
      expect(result).toBe(true);
      expect(StorageManager.get('test')).toBe(null);
    });

    it('should handle removing non-existent key', () => {
      const result = StorageManager.remove('nonexistent');
      expect(result).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all dashboard keys', () => {
      StorageManager.set('dashboard_theme', 'dark');
      StorageManager.set('dashboard_username', 'John');
      StorageManager.set('dashboard_tasks', []);
      
      const result = StorageManager.clear();
      expect(result).toBe(true);
      expect(StorageManager.get('dashboard_theme')).toBe(null);
      expect(StorageManager.get('dashboard_username')).toBe(null);
      expect(StorageManager.get('dashboard_tasks')).toBe(null);
    });

    it('should not affect non-dashboard keys', () => {
      localStorage.setItem('other_app_key', 'value');
      StorageManager.clear();
      expect(localStorage.getItem('other_app_key')).toBe('value');
    });
  });

  describe('in-memory fallback', () => {
    beforeEach(() => {
      // Simulate localStorage unavailability
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('Storage disabled');
      };
      StorageManager.storageAvailable = null;
      StorageManager.isAvailable();
      Storage.prototype.setItem = originalSetItem;
    });

    it('should use in-memory storage when localStorage unavailable', () => {
      StorageManager.set('test', 'value');
      expect(StorageManager.get('test')).toBe('value');
    });

    it('should handle in-memory get with default', () => {
      expect(StorageManager.get('nonexistent', 'default')).toBe('default');
    });

    it('should handle in-memory remove', () => {
      StorageManager.set('test', 'value');
      StorageManager.remove('test');
      expect(StorageManager.get('test')).toBe(null);
    });

    it('should handle in-memory clear', () => {
      StorageManager.set('dashboard_theme', 'dark');
      StorageManager.clear();
      expect(StorageManager.get('dashboard_theme')).toBe(null);
    });
  });
});
