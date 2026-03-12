import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TimerWidget from '../../components/timer.js';
import StorageManager from '../../utils/storage.js';

describe('TimerWidget', () => {
  let container;
  let timer;

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
    if (timer) {
      timer.destroy();
    }
    document.body.removeChild(container);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('init', () => {
    it('should create DOM structure with display, controls, and settings', () => {
      timer = new TimerWidget(container);
      timer.init();

      expect(container.querySelector('.timer-display')).toBeTruthy();
      expect(container.querySelector('.timer-controls')).toBeTruthy();
      expect(container.querySelector('.btn-start')).toBeTruthy();
      expect(container.querySelector('.btn-stop')).toBeTruthy();
      expect(container.querySelector('.btn-reset')).toBeTruthy();
      expect(container.querySelector('.timer-settings')).toBeTruthy();
      expect(container.querySelector('.duration-input')).toBeTruthy();
      expect(container.querySelector('.btn-set-duration')).toBeTruthy();
    });

    it('should initialize with 25 minute default duration', () => {
      timer = new TimerWidget(container);
      timer.init();

      expect(timer.duration).toBe(25 * 60);
      expect(timer.remaining).toBe(25 * 60);
      expect(container.querySelector('.timer-display').textContent).toBe('25:00');
    });

    it('should load custom duration from storage', () => {
      StorageManager.get.mockReturnValue(30 * 60); // 30 minutes
      
      timer = new TimerWidget(container);
      timer.init();

      expect(StorageManager.get).toHaveBeenCalledWith('dashboard_timer_duration', null);
      expect(timer.duration).toBe(30 * 60);
      expect(timer.remaining).toBe(30 * 60);
    });

    it('should ignore invalid duration from storage (too small)', () => {
      StorageManager.get.mockReturnValue(30); // 30 seconds (< 60)
      
      timer = new TimerWidget(container);
      timer.init();

      expect(timer.duration).toBe(25 * 60); // Should use default
    });

    it('should ignore invalid duration from storage (too large)', () => {
      StorageManager.get.mockReturnValue(8000); // > 7200 seconds
      
      timer = new TimerWidget(container);
      timer.init();

      expect(timer.duration).toBe(25 * 60); // Should use default
    });

    it('should set isRunning to false initially', () => {
      timer = new TimerWidget(container);
      timer.init();

      expect(timer.isRunning).toBe(false);
    });
  });

  describe('start', () => {
    beforeEach(() => {
      timer = new TimerWidget(container);
      timer.init();
    });

    it('should set isRunning to true', () => {
      timer.start();
      expect(timer.isRunning).toBe(true);
    });

    it('should create interval for countdown', () => {
      timer.start();
      expect(timer.intervalId).not.toBeNull();
    });

    it('should not create multiple intervals if already running', () => {
      timer.start();
      const firstIntervalId = timer.intervalId;
      
      timer.start();
      expect(timer.intervalId).toBe(firstIntervalId);
    });

    it('should call tick every second', () => {
      const tickSpy = vi.spyOn(timer, 'tick');
      
      timer.start();
      vi.advanceTimersByTime(1000);
      
      expect(tickSpy).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(2000);
      expect(tickSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('stop', () => {
    beforeEach(() => {
      timer = new TimerWidget(container);
      timer.init();
    });

    it('should set isRunning to false', () => {
      timer.start();
      timer.stop();
      
      expect(timer.isRunning).toBe(false);
    });

    it('should clear interval', () => {
      timer.start();
      const intervalId = timer.intervalId;
      
      timer.stop();
      
      expect(timer.intervalId).toBeNull();
    });

    it('should preserve remaining time', () => {
      timer.start();
      vi.advanceTimersByTime(3000); // 3 seconds
      
      const remainingBeforeStop = timer.remaining;
      timer.stop();
      
      expect(timer.remaining).toBe(remainingBeforeStop);
    });

    it('should not throw error when called while not running', () => {
      expect(() => timer.stop()).not.toThrow();
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      timer = new TimerWidget(container);
      timer.init();
    });

    it('should restore remaining time to initial duration', () => {
      timer.start();
      vi.advanceTimersByTime(5000); // 5 seconds
      
      timer.reset();
      
      expect(timer.remaining).toBe(timer.duration);
    });

    it('should stop the timer if running', () => {
      timer.start();
      timer.reset();
      
      expect(timer.isRunning).toBe(false);
      expect(timer.intervalId).toBeNull();
    });

    it('should update display to show full duration', () => {
      timer.start();
      vi.advanceTimersByTime(5000);
      
      timer.reset();
      
      const display = container.querySelector('.timer-display');
      expect(display.textContent).toBe('25:00');
    });
  });

  describe('tick', () => {
    beforeEach(() => {
      timer = new TimerWidget(container);
      timer.init();
    });

    it('should decrease remaining time by 1 second', () => {
      const initialRemaining = timer.remaining;
      
      timer.tick();
      
      expect(timer.remaining).toBe(initialRemaining - 1);
    });

    it('should update display with new time', () => {
      timer.tick();
      
      const display = container.querySelector('.timer-display');
      expect(display.textContent).toBe('24:59');
    });

    it('should call onComplete when reaching zero', () => {
      const onCompleteSpy = vi.spyOn(timer, 'onComplete');
      
      timer.remaining = 1;
      timer.tick();
      
      expect(onCompleteSpy).toHaveBeenCalled();
    });

    it('should not go below zero', () => {
      timer.remaining = 0;
      timer.tick();
      
      expect(timer.remaining).toBe(0);
    });
  });

  describe('onComplete', () => {
    beforeEach(() => {
      timer = new TimerWidget(container);
      timer.init();
      
      // Mock alert to avoid actual alerts during tests
      vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    it('should stop the timer', () => {
      timer.start();
      timer.onComplete();
      
      expect(timer.isRunning).toBe(false);
      expect(timer.intervalId).toBeNull();
    });

    it('should show notification', () => {
      timer.onComplete();
      
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('setDuration', () => {
    beforeEach(() => {
      timer = new TimerWidget(container);
      timer.init();
    });

    it('should update duration and remaining time', () => {
      timer.setDuration(30);
      
      expect(timer.duration).toBe(30 * 60);
      expect(timer.remaining).toBe(30 * 60);
    });

    it('should persist duration to storage', () => {
      timer.setDuration(45);
      
      expect(StorageManager.set).toHaveBeenCalledWith('dashboard_timer_duration', 45 * 60);
    });

    it('should update display', () => {
      timer.setDuration(10);
      
      const display = container.querySelector('.timer-display');
      expect(display.textContent).toBe('10:00');
    });

    it('should reject duration less than 1 minute', () => {
      const originalDuration = timer.duration;
      
      timer.setDuration(0);
      
      expect(timer.duration).toBe(originalDuration);
    });

    it('should reject duration greater than 120 minutes', () => {
      const originalDuration = timer.duration;
      
      timer.setDuration(150);
      
      expect(timer.duration).toBe(originalDuration);
    });

    it('should accept boundary values (1 and 120 minutes)', () => {
      timer.setDuration(1);
      expect(timer.duration).toBe(60);
      
      timer.setDuration(120);
      expect(timer.duration).toBe(7200);
    });
  });

  describe('formatTime', () => {
    beforeEach(() => {
      timer = new TimerWidget(container);
    });

    it('should format time as MM:SS', () => {
      expect(timer.formatTime(0)).toBe('00:00');
      expect(timer.formatTime(59)).toBe('00:59');
      expect(timer.formatTime(60)).toBe('01:00');
      expect(timer.formatTime(125)).toBe('02:05');
      expect(timer.formatTime(3599)).toBe('59:59');
      expect(timer.formatTime(3600)).toBe('60:00');
    });

    it('should pad single digits with zero', () => {
      expect(timer.formatTime(5)).toBe('00:05');
      expect(timer.formatTime(65)).toBe('01:05');
    });
  });

  describe('button interactions', () => {
    beforeEach(() => {
      timer = new TimerWidget(container);
      timer.init();
    });

    it('should start timer when start button clicked', () => {
      const startBtn = container.querySelector('.btn-start');
      startBtn.click();
      
      expect(timer.isRunning).toBe(true);
    });

    it('should stop timer when stop button clicked', () => {
      timer.start();
      
      const stopBtn = container.querySelector('.btn-stop');
      stopBtn.click();
      
      expect(timer.isRunning).toBe(false);
    });

    it('should reset timer when reset button clicked', () => {
      timer.start();
      vi.advanceTimersByTime(5000);
      
      const resetBtn = container.querySelector('.btn-reset');
      resetBtn.click();
      
      expect(timer.remaining).toBe(timer.duration);
      expect(timer.isRunning).toBe(false);
    });

    it('should set custom duration when set duration button clicked', () => {
      const input = container.querySelector('.duration-input');
      const setBtn = container.querySelector('.btn-set-duration');
      
      input.value = '15';
      setBtn.click();
      
      expect(timer.duration).toBe(15 * 60);
    });
  });

  describe('destroy', () => {
    it('should stop timer and clear interval', () => {
      timer = new TimerWidget(container);
      timer.init();
      timer.start();
      
      timer.destroy();
      
      expect(timer.isRunning).toBe(false);
      expect(timer.intervalId).toBeNull();
    });

    it('should not throw error when called multiple times', () => {
      timer = new TimerWidget(container);
      timer.init();
      
      expect(() => {
        timer.destroy();
        timer.destroy();
      }).not.toThrow();
    });
  });
});
