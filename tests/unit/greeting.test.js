import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GreetingDisplay from '../../components/greeting.js';
import StorageManager from '../../utils/storage.js';

describe('GreetingDisplay', () => {
  let container;
  let greeting;

  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Mock StorageManager
    vi.spyOn(StorageManager, 'get').mockReturnValue(null);
    vi.spyOn(StorageManager, 'set').mockReturnValue(true);
    
    // Use fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (greeting) {
      greeting.destroy();
    }
    document.body.removeChild(container);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('init', () => {
    it('should create DOM structure with greeting, date, and time elements', () => {
      greeting = new GreetingDisplay(container);
      greeting.init();

      expect(container.querySelector('.greeting-container')).toBeTruthy();
      expect(container.querySelector('.greeting-message')).toBeTruthy();
      expect(container.querySelector('.date-display')).toBeTruthy();
      expect(container.querySelector('.time-display')).toBeTruthy();
    });

    it('should load custom username from storage', () => {
      StorageManager.get.mockReturnValue('Alice');
      
      greeting = new GreetingDisplay(container);
      greeting.init();

      expect(StorageManager.get).toHaveBeenCalledWith('dashboard_username', null);
      expect(greeting.username).toBe('Alice');
    });

    it('should use default username when storage is empty', () => {
      greeting = new GreetingDisplay(container);
      greeting.init();

      expect(greeting.username).toBe('User');
    });

    it('should start interval to update time every second', () => {
      greeting = new GreetingDisplay(container);
      greeting.init();

      expect(greeting.intervalId).not.toBeNull();
    });
  });

  describe('getGreeting', () => {
    beforeEach(() => {
      greeting = new GreetingDisplay(container);
    });

    it('should return "Good Morning" for hours 5-11', () => {
      const testCases = [5, 7, 9, 11];
      
      testCases.forEach(hour => {
        vi.setSystemTime(new Date(2024, 0, 1, hour, 0, 0));
        expect(greeting.getGreeting()).toBe('Good Morning');
      });
    });

    it('should return "Good Afternoon" for hours 12-16', () => {
      const testCases = [12, 14, 16];
      
      testCases.forEach(hour => {
        vi.setSystemTime(new Date(2024, 0, 1, hour, 0, 0));
        expect(greeting.getGreeting()).toBe('Good Afternoon');
      });
    });

    it('should return "Good Evening" for hours 17-20', () => {
      const testCases = [17, 19, 20];
      
      testCases.forEach(hour => {
        vi.setSystemTime(new Date(2024, 0, 1, hour, 0, 0));
        expect(greeting.getGreeting()).toBe('Good Evening');
      });
    });

    it('should return "Good Night" for hours 21-4', () => {
      const testCases = [21, 23, 0, 2, 4];
      
      testCases.forEach(hour => {
        vi.setSystemTime(new Date(2024, 0, 1, hour, 0, 0));
        expect(greeting.getGreeting()).toBe('Good Night');
      });
    });
  });

  describe('updateTime', () => {
    it('should update greeting message with current greeting and username', () => {
      vi.setSystemTime(new Date(2024, 0, 1, 10, 30, 45));
      
      greeting = new GreetingDisplay(container);
      greeting.init();

      const greetingMessage = container.querySelector('.greeting-message');
      expect(greetingMessage.textContent).toBe('Good Morning, User');
    });

    it('should update date display with formatted date', () => {
      vi.setSystemTime(new Date(2024, 0, 1, 10, 30, 45));
      
      greeting = new GreetingDisplay(container);
      greeting.init();

      const dateDisplay = container.querySelector('.date-display');
      expect(dateDisplay.textContent).toContain('Monday');
      expect(dateDisplay.textContent).toContain('January');
      expect(dateDisplay.textContent).toContain('1');
      expect(dateDisplay.textContent).toContain('2024');
    });

    it('should update time display with formatted time', () => {
      vi.setSystemTime(new Date(2024, 0, 1, 10, 30, 45));
      
      greeting = new GreetingDisplay(container);
      greeting.init();

      const timeDisplay = container.querySelector('.time-display');
      expect(timeDisplay.textContent).toMatch(/10:30:45/);
    });

    it('should update time every second', () => {
      vi.setSystemTime(new Date(2024, 0, 1, 10, 30, 45));
      
      greeting = new GreetingDisplay(container);
      greeting.init();

      const timeDisplay = container.querySelector('.time-display');
      const initialTime = timeDisplay.textContent;

      // Advance time by 1 second
      vi.advanceTimersByTime(1000);

      const updatedTime = timeDisplay.textContent;
      expect(updatedTime).not.toBe(initialTime);
    });
  });

  describe('setUsername', () => {
    beforeEach(() => {
      greeting = new GreetingDisplay(container);
      greeting.init();
    });

    it('should update username and save to storage', () => {
      greeting.setUsername('Bob');

      expect(greeting.username).toBe('Bob');
      expect(StorageManager.set).toHaveBeenCalledWith('dashboard_username', 'Bob');
    });

    it('should trim whitespace from username', () => {
      greeting.setUsername('  Charlie  ');

      expect(greeting.username).toBe('Charlie');
      expect(StorageManager.set).toHaveBeenCalledWith('dashboard_username', 'Charlie');
    });

    it('should use default username for empty string', () => {
      greeting.setUsername('');

      expect(greeting.username).toBe('User');
    });

    it('should update display with new username', () => {
      vi.setSystemTime(new Date(2024, 0, 1, 10, 0, 0));
      
      greeting.setUsername('Diana');

      const greetingMessage = container.querySelector('.greeting-message');
      expect(greetingMessage.textContent).toBe('Good Morning, Diana');
    });

    it('should handle null or undefined gracefully', () => {
      const originalUsername = greeting.username;
      
      greeting.setUsername(null);
      expect(greeting.username).toBe(originalUsername);
      
      greeting.setUsername(undefined);
      expect(greeting.username).toBe(originalUsername);
    });
  });

  describe('destroy', () => {
    it('should clear interval timer', () => {
      greeting = new GreetingDisplay(container);
      greeting.init();

      const intervalId = greeting.intervalId;
      expect(intervalId).not.toBeNull();

      greeting.destroy();

      expect(greeting.intervalId).toBeNull();
    });

    it('should not throw error when called multiple times', () => {
      greeting = new GreetingDisplay(container);
      greeting.init();

      expect(() => {
        greeting.destroy();
        greeting.destroy();
      }).not.toThrow();
    });
  });
});
