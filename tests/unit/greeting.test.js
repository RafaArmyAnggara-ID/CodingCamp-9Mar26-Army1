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

    it('should NOT update greeting message every second', () => {
      vi.setSystemTime(new Date(2024, 0, 1, 10, 30, 45));
      
      greeting = new GreetingDisplay(container);
      greeting.init();

      const greetingMessage = container.querySelector('.greeting-message');
      const initialGreeting = greetingMessage.textContent;

      // Advance time by 1 second
      vi.advanceTimersByTime(1000);

      const updatedGreeting = greetingMessage.textContent;
      expect(updatedGreeting).toBe(initialGreeting);
    });

    it('should update greeting message only after 5 minutes', () => {
      vi.setSystemTime(new Date(2024, 0, 1, 10, 30, 0));
      
      greeting = new GreetingDisplay(container);
      greeting.init();

      const greetingMessage = container.querySelector('.greeting-message');
      expect(greetingMessage.textContent).toBe('Good Morning, User');

      // Advance time by 4 minutes 59 seconds - should NOT update
      vi.advanceTimersByTime(4 * 60 * 1000 + 59 * 1000);
      expect(greetingMessage.textContent).toBe('Good Morning, User');

      // Change to afternoon time but greeting should still be morning
      vi.setSystemTime(new Date(2024, 0, 1, 12, 34, 59));
      vi.advanceTimersByTime(1000);
      expect(greetingMessage.textContent).toBe('Good Morning, User');

      // Advance 1 more second to complete 5 minutes - should update now
      vi.advanceTimersByTime(1000);
      expect(greetingMessage.textContent).toBe('Good Afternoon, User');
    });

    it('should track last greeting update time', () => {
      vi.setSystemTime(new Date(2024, 0, 1, 10, 0, 0));
      
      greeting = new GreetingDisplay(container);
      greeting.init();

      expect(greeting.lastGreetingUpdate).toBeTruthy();
      const firstUpdate = greeting.lastGreetingUpdate;

      // Advance 1 second - should not update
      vi.advanceTimersByTime(1000);
      expect(greeting.lastGreetingUpdate).toBe(firstUpdate);

      // Advance 5 minutes - should update
      vi.advanceTimersByTime(5 * 60 * 1000);
      expect(greeting.lastGreetingUpdate).toBeGreaterThan(firstUpdate);
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

    it('should update display with new username immediately', () => {
      vi.setSystemTime(new Date(2024, 0, 1, 10, 0, 0));
      
      greeting.setUsername('Diana');

      const greetingMessage = container.querySelector('.greeting-message');
      expect(greetingMessage.textContent).toBe('Good Morning, Diana');
    });

    it('should update lastGreetingUpdate when username changes', () => {
      const beforeTime = Date.now();
      greeting.setUsername('TestUser');
      
      expect(greeting.lastGreetingUpdate).toBeGreaterThanOrEqual(beforeTime);
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

  describe('edit username functionality', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date(2024, 0, 1, 10, 0, 0));
      greeting = new GreetingDisplay(container);
      greeting.init();
    });

    it('should render edit button', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      expect(editBtn).toBeTruthy();
    });

    it('should render edit timer container (hidden by default)', () => {
      const timerContainer = container.querySelector('.edit-timer-container');
      expect(timerContainer).toBeTruthy();
      expect(timerContainer.style.display).toBe('none');
    });

    it('should show input when edit button is clicked', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const input = container.querySelector('.username-edit-input');
      expect(input).toBeTruthy();
      expect(input.value).toBe('User');
    });

    it('should show timer when edit starts', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const timerContainer = container.querySelector('.edit-timer-container');
      expect(timerContainer.style.display).toBe('block');
    });

    it('should start countdown at 5:00', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const countdown = container.querySelector('.edit-timer-countdown');
      expect(countdown.textContent).toBe('5:00');
    });

    it('should update countdown every second', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const countdown = container.querySelector('.edit-timer-countdown');
      expect(countdown.textContent).toBe('5:00');

      // Advance 1 second
      vi.advanceTimersByTime(1000);
      expect(countdown.textContent).toBe('4:59');

      // Advance 59 more seconds
      vi.advanceTimersByTime(59000);
      expect(countdown.textContent).toBe('4:00');
    });

    it('should update username when Enter is pressed', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const input = container.querySelector('.username-edit-input');
      input.value = 'John';
      
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      input.dispatchEvent(event);

      expect(greeting.username).toBe('John');
      expect(StorageManager.set).toHaveBeenCalledWith('dashboard_username', 'John');
      
      const greetingMessage = container.querySelector('.greeting-message');
      expect(greetingMessage.textContent).toBe('Good Morning, John');
    });

    it('should hide timer when edit is saved', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const input = container.querySelector('.username-edit-input');
      input.value = 'John';
      input.blur();

      const timerContainer = container.querySelector('.edit-timer-container');
      expect(timerContainer.style.display).toBe('none');
    });

    it('should update username when input loses focus', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const input = container.querySelector('.username-edit-input');
      input.value = 'Sarah';
      
      input.blur();

      expect(greeting.username).toBe('Sarah');
      expect(StorageManager.set).toHaveBeenCalledWith('dashboard_username', 'Sarah');
    });

    it('should trim whitespace from username', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const input = container.querySelector('.username-edit-input');
      input.value = '  Mike  ';
      
      input.blur();

      expect(greeting.username).toBe('Mike');
    });

    it('should use default username for empty input', () => {
      greeting.setUsername('TestUser');
      
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const input = container.querySelector('.username-edit-input');
      input.value = '';
      
      input.blur();

      expect(greeting.username).toBe('User');
    });

    it('should cancel edit when Escape is pressed', () => {
      greeting.setUsername('Original');
      
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const input = container.querySelector('.username-edit-input');
      input.value = 'Changed';
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      input.dispatchEvent(event);

      expect(greeting.username).toBe('Original');
      
      const greetingMessage = container.querySelector('.greeting-message');
      expect(greetingMessage.textContent).toBe('Good Morning, Original');
    });

    it('should hide timer when edit is cancelled', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const input = container.querySelector('.username-edit-input');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      input.dispatchEvent(event);

      const timerContainer = container.querySelector('.edit-timer-container');
      expect(timerContainer.style.display).toBe('none');
    });

    it('should reject username longer than 50 characters', () => {
      greeting.setUsername('Original');
      
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const input = container.querySelector('.username-edit-input');
      const longName = 'a'.repeat(51);
      input.value = longName;
      
      input.blur();

      expect(greeting.username).toBe('Original');
    });

    it('should focus and select input text when edit button is clicked', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const input = container.querySelector('.username-edit-input');
      expect(document.activeElement).toBe(input);
    });

    it('should update display without refresh after editing', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      const greetingMessage = container.querySelector('.greeting-message');
      
      // Initial state
      expect(greetingMessage.textContent).toBe('Good Morning, User');
      
      // Edit username
      editBtn.click();
      const input = container.querySelector('.username-edit-input');
      input.value = 'Emma';
      input.blur();
      
      // Check updated without full re-render
      expect(greetingMessage.textContent).toBe('Good Morning, Emma');
      expect(container.querySelector('.btn-edit-username')).toBeTruthy();
    });

    it('should auto-cancel edit after 5 minutes', () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      const input = container.querySelector('.username-edit-input');
      input.value = 'NewName';

      // Advance time by 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000);

      expect(window.alert).toHaveBeenCalledWith('Edit time expired. Please try again.');
      expect(greeting.username).toBe('User'); // Should not change
      
      const timerContainer = container.querySelector('.edit-timer-container');
      expect(timerContainer.style.display).toBe('none');

      window.alert.mockRestore();
    });

    it('should get remaining edit time correctly', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      // Initially should be 300 seconds (5 minutes)
      expect(greeting.getRemainingEditTime()).toBe(300);

      // After 1 second
      vi.advanceTimersByTime(1000);
      expect(greeting.getRemainingEditTime()).toBe(299);

      // After 1 minute total
      vi.advanceTimersByTime(59000);
      expect(greeting.getRemainingEditTime()).toBe(240);
    });

    it('should return 0 remaining time when not editing', () => {
      expect(greeting.getRemainingEditTime()).toBe(0);
    });

    it('should clear all timers when edit is completed', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      expect(greeting.editTimeoutId).not.toBeNull();
      expect(greeting.editCountdownIntervalId).not.toBeNull();

      const input = container.querySelector('.username-edit-input');
      input.value = 'Test';
      input.blur();

      expect(greeting.editTimeoutId).toBeNull();
      expect(greeting.editCountdownIntervalId).toBeNull();
    });

    it('should clear all timers when edit is cancelled', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      expect(greeting.editTimeoutId).not.toBeNull();
      expect(greeting.editCountdownIntervalId).not.toBeNull();

      const input = container.querySelector('.username-edit-input');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      input.dispatchEvent(event);

      expect(greeting.editTimeoutId).toBeNull();
      expect(greeting.editCountdownIntervalId).toBeNull();
    });

    it('should clear edit timers on destroy', () => {
      const editBtn = container.querySelector('.btn-edit-username');
      editBtn.click();

      expect(greeting.editTimeoutId).not.toBeNull();

      greeting.destroy();

      expect(greeting.editTimeoutId).toBeNull();
      expect(greeting.editCountdownIntervalId).toBeNull();
    });
  });
});
