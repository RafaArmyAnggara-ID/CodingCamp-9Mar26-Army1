/**
 * TimerWidget - Countdown timer for focus sessions (Pomodoro technique)
 */
import StorageManager from '../utils/storage.js';

class TimerWidget {
  constructor(containerElement) {
    this.container = containerElement;
    this.duration = 25 * 60; // Default 25 minutes in seconds
    this.remaining = this.duration;
    this.isRunning = false;
    this.intervalId = null;
  }

  /**
   * Initialize timer with saved or default duration
   */
  init() {
    // Load custom duration from storage if available
    const savedDuration = StorageManager.get('dashboard_timer_duration', null);
    if (savedDuration !== null && savedDuration >= 60 && savedDuration <= 7200) {
      this.duration = savedDuration;
      this.remaining = savedDuration;
    }

    this.render();
    this.attachEventListeners();
  }

  /**
   * Render the timer UI
   */
  render() {
    this.container.innerHTML = `
      <div class="timer-display">${this.formatTime(this.remaining)}</div>
      <div class="timer-controls">
        <button class="btn-start">Start</button>
        <button class="btn-stop">Stop</button>
        <button class="btn-reset">Reset</button>
      </div>
      <div class="timer-settings">
        <input type="number" class="duration-input" min="1" max="120" value="${Math.floor(this.duration / 60)}" />
        <button class="btn-set-duration">Set Duration</button>
      </div>
    `;
  }

  /**
   * Attach event listeners to timer controls
   */
  attachEventListeners() {
    const startBtn = this.container.querySelector('.btn-start');
    const stopBtn = this.container.querySelector('.btn-stop');
    const resetBtn = this.container.querySelector('.btn-reset');
    const setDurationBtn = this.container.querySelector('.btn-set-duration');

    startBtn.addEventListener('click', () => this.start());
    stopBtn.addEventListener('click', () => this.stop());
    resetBtn.addEventListener('click', () => this.reset());
    setDurationBtn.addEventListener('click', () => {
      const input = this.container.querySelector('.duration-input');
      const minutes = parseInt(input.value, 10);
      if (!isNaN(minutes)) {
        this.setDuration(minutes);
      }
    });
  }

  /**
   * Start countdown
   */
  start() {
    if (this.isRunning) {
      return; // Already running
    }

    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  /**
   * Pause countdown
   */
  stop() {
    if (!this.isRunning) {
      return; // Already stopped
    }

    this.isRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Reset to initial duration
   */
  reset() {
    this.stop();
    this.remaining = this.duration;
    this.updateDisplay();
  }

  /**
   * Update display (called every second while running)
   */
  tick() {
    if (this.remaining > 0) {
      this.remaining--;
      this.updateDisplay();
    }

    if (this.remaining === 0) {
      this.onComplete();
    }
  }

  /**
   * Handle timer completion
   */
  onComplete() {
    this.stop();
    this.showNotification('Timer Complete!', 'Your focus session has ended.');
  }

  /**
   * Set custom duration (in minutes)
   * @param {number} minutes - Duration in minutes (1-120)
   */
  setDuration(minutes) {
    // Validate input
    if (minutes < 1 || minutes > 120) {
      console.warn('Duration must be between 1 and 120 minutes');
      return;
    }

    const seconds = minutes * 60;
    this.duration = seconds;
    this.remaining = seconds;
    
    // Persist to storage
    StorageManager.set('dashboard_timer_duration', seconds);
    
    this.updateDisplay();
  }

  /**
   * Update the timer display
   */
  updateDisplay() {
    const display = this.container.querySelector('.timer-display');
    if (display) {
      display.textContent = this.formatTime(this.remaining);
    }
  }

  /**
   * Format seconds as MM:SS
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Show completion notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   */
  showNotification(title, message) {
    // Try to use browser notifications if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    } else {
      // Fallback to alert
      alert(`${title}\n${message}`);
    }
  }

  /**
   * Cleanup timers
   */
  destroy() {
    this.stop();
  }
}

export default TimerWidget;
