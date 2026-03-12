import StorageManager from '../utils/storage.js';

/**
 * GreetingDisplay - Displays time-based greeting with current date and time
 * Updates time every second and loads custom username from storage
 */
class GreetingDisplay {
  constructor(containerElement) {
    this.container = containerElement;
    this.username = 'User';
    this.intervalId = null;
  }

  /**
   * Initialize component and start clock
   */
  init() {
    // Load custom username from storage
    const savedUsername = StorageManager.get('dashboard_username', null);
    if (savedUsername) {
      this.username = savedUsername;
    }

    // Create DOM structure
    this.render();

    // Start updating time every second
    this.updateTime();
    this.intervalId = setInterval(() => this.updateTime(), 1000);
  }

  /**
   * Create initial DOM structure
   */
  render() {
    this.container.innerHTML = `
      <div class="greeting-container">
        <h1 class="greeting-message"></h1>
        <div class="date-display"></div>
        <div class="time-display"></div>
      </div>
    `;
  }

  /**
   * Update time display (called every second)
   */
  updateTime() {
    const now = new Date();
    
    // Update greeting message
    const greetingElement = this.container.querySelector('.greeting-message');
    if (greetingElement) {
      greetingElement.textContent = `${this.getGreeting()}, ${this.username}`;
    }

    // Update date display
    const dateElement = this.container.querySelector('.date-display');
    if (dateElement) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateElement.textContent = now.toLocaleDateString('en-US', options);
    }

    // Update time display
    const timeElement = this.container.querySelector('.time-display');
    if (timeElement) {
      timeElement.textContent = now.toLocaleTimeString('en-US');
    }
  }

  /**
   * Get appropriate greeting based on current hour
   * @returns {string} Greeting message
   */
  getGreeting() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour <= 11) {
      return 'Good Morning';
    } else if (hour >= 12 && hour <= 16) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour <= 20) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  }

  /**
   * Set custom username
   * @param {string} name - Custom username
   */
  setUsername(name) {
    if (name && typeof name === 'string') {
      this.username = name.trim() || 'User';
      StorageManager.set('dashboard_username', this.username);
      this.updateTime(); // Refresh display with new name
    }
  }

  /**
   * Cleanup timers
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default GreetingDisplay;
