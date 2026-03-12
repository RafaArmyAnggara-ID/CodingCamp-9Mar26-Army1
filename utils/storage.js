/**
 * StorageManager - Provides a unified interface for Local Storage operations
 * with error handling and fallback to in-memory storage
 */
class StorageManager {
  static inMemoryStorage = {};
  static storageAvailable = null;

  /**
   * Check if Local Storage is available
   * @returns {boolean} True if Local Storage is available
   */
  static isAvailable() {
    if (this.storageAvailable !== null) {
      return this.storageAvailable;
    }

    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.storageAvailable = true;
      return true;
    } catch (e) {
      console.warn('Local Storage is not available. Using in-memory storage.', e);
      this.storageAvailable = false;
      return false;
    }
  }

  /**
   * Get data from storage with optional default value
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Retrieved value or default
   */
  static get(key, defaultValue = null) {
    try {
      if (this.isAvailable()) {
        const item = localStorage.getItem(key);
        if (item === null) {
          return defaultValue;
        }
        
        try {
          return JSON.parse(item);
        } catch (parseError) {
          console.error(`Failed to parse stored data for key "${key}". Returning default.`, parseError);
          // Clear corrupted data
          this.remove(key);
          return defaultValue;
        }
      } else {
        // Use in-memory storage
        return this.inMemoryStorage.hasOwnProperty(key) 
          ? this.inMemoryStorage[key] 
          : defaultValue;
      }
    } catch (error) {
      console.error(`Error getting data for key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Save data to storage (automatically serializes objects)
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} True if successful, false otherwise
   */
  static set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      
      if (this.isAvailable()) {
        try {
          localStorage.setItem(key, serialized);
          return true;
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.error('Storage quota exceeded. Unable to save data.', error);
            // Optionally notify user or attempt cleanup
            return false;
          }
          throw error;
        }
      } else {
        // Use in-memory storage
        this.inMemoryStorage[key] = value;
        return true;
      }
    } catch (error) {
      console.error(`Error setting data for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove data from storage
   * @param {string} key - Storage key to remove
   * @returns {boolean} True if successful, false otherwise
   */
  static remove(key) {
    try {
      if (this.isAvailable()) {
        localStorage.removeItem(key);
      } else {
        delete this.inMemoryStorage[key];
      }
      return true;
    } catch (error) {
      console.error(`Error removing data for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all application data
   * @returns {boolean} True if successful, false otherwise
   */
  static clear() {
    try {
      if (this.isAvailable()) {
        // Only clear dashboard-specific keys to avoid affecting other apps
        const dashboardKeys = [
          'dashboard_theme',
          'dashboard_username',
          'dashboard_timer_duration',
          'dashboard_tasks',
          'dashboard_links'
        ];
        
        dashboardKeys.forEach(key => {
          localStorage.removeItem(key);
        });
      } else {
        this.inMemoryStorage = {};
      }
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
}

// Export for use in other modules
export default StorageManager;
