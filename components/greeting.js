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
    this.editTimeoutId = null;
    this.editTimeLimit = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.editStartTime = null;
    this.editCountdownIntervalId = null;
    this.greetingUpdateInterval = 5 * 60 * 1000; // 5 minutes for greeting update
    this.lastGreetingUpdate = null;
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
        <div class="greeting-header">
          <h1 class="greeting-message"></h1>
          <button class="btn-edit-username" title="Edit name">✏️</button>
        </div>
        <div class="date-display"></div>
        <div class="time-display"></div>
        <div class="edit-timer-container" style="display: none;">
          <div class="edit-timer-message">Time remaining to edit: <span class="edit-timer-countdown">5:00</span></div>
        </div>
      </div>
    `;
    this.attachEventListeners();
  }

  /**
   * Update time display (called every second)
   */
  updateTime() {
    const now = new Date();
    
    // Check if greeting needs update (every 5 minutes)
    const shouldUpdateGreeting = !this.lastGreetingUpdate || 
                                  (now.getTime() - this.lastGreetingUpdate) >= this.greetingUpdateInterval;
    
    // Update greeting message only every 5 minutes
    if (shouldUpdateGreeting) {
      const greetingElement = this.container.querySelector('.greeting-message');
      if (greetingElement) {
        greetingElement.textContent = `${this.getGreeting()}, ${this.username}`;
      }
      this.lastGreetingUpdate = now.getTime();
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
      
      // Force update greeting immediately when username changes
      const greetingElement = this.container.querySelector('.greeting-message');
      if (greetingElement) {
        greetingElement.textContent = `${this.getGreeting()}, ${this.username}`;
      }
      this.lastGreetingUpdate = Date.now();
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const editBtn = this.container.querySelector('.btn-edit-username');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.handleEditUsername();
      });
    }
  }

  /**
   * Handle username editing with inline input
   */
  handleEditUsername() {
    const greetingMessage = this.container.querySelector('.greeting-message');
    if (!greetingMessage) return;

    const currentUsername = this.username;

    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'username-edit-input';
    input.value = currentUsername;
    input.maxLength = 50;
    input.placeholder = 'Enter your name';

    // Replace greeting message with input
    const originalContent = greetingMessage.textContent;
    greetingMessage.textContent = '';
    greetingMessage.appendChild(input);
    input.focus();
    input.select();

    // Start edit timer
    this.startEditTimer();

    // Save on blur or Enter
    const saveEdit = () => {
      this.stopEditTimer();
      const newName = input.value.trim();
      if (newName && newName.length > 0 && newName.length <= 50) {
        this.setUsername(newName);
      } else if (newName.length === 0) {
        this.setUsername('User');
      } else {
        // Revert if invalid
        const greetingElement = this.container.querySelector('.greeting-message');
        if (greetingElement) {
          greetingElement.textContent = `${this.getGreeting()}, ${this.username}`;
        }
      }
    };

    // Cancel on Escape
    const cancelEdit = () => {
      this.stopEditTimer();
      
      // Restore greeting message
      const greetingElement = this.container.querySelector('.greeting-message');
      if (greetingElement) {
        greetingElement.textContent = `${this.getGreeting()}, ${this.username}`;
      }
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveEdit();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cancelEdit();
      }
    });
  }

  /**
   * Start edit timer (5 minutes countdown)
   */
  startEditTimer() {
    this.editStartTime = Date.now();
    
    // Show timer container
    const timerContainer = this.container.querySelector('.edit-timer-container');
    if (timerContainer) {
      timerContainer.style.display = 'block';
    }

    // Update countdown every second
    this.updateEditCountdown();
    this.editCountdownIntervalId = setInterval(() => {
      this.updateEditCountdown();
    }, 1000);

    // Set timeout to auto-cancel after 5 minutes
    this.editTimeoutId = setTimeout(() => {
      this.cancelEditDueToTimeout();
    }, this.editTimeLimit);
  }

  /**
   * Stop edit timer
   */
  stopEditTimer() {
    if (this.editTimeoutId) {
      clearTimeout(this.editTimeoutId);
      this.editTimeoutId = null;
    }

    if (this.editCountdownIntervalId) {
      clearInterval(this.editCountdownIntervalId);
      this.editCountdownIntervalId = null;
    }

    this.editStartTime = null;

    // Hide timer container
    const timerContainer = this.container.querySelector('.edit-timer-container');
    if (timerContainer) {
      timerContainer.style.display = 'none';
    }
  }

  /**
   * Update edit countdown display
   */
  updateEditCountdown() {
    if (!this.editStartTime) return;

    const elapsed = Date.now() - this.editStartTime;
    const remaining = Math.max(0, this.editTimeLimit - elapsed);
    const seconds = Math.ceil(remaining / 1000);

    const countdownElement = this.container.querySelector('.edit-timer-countdown');
    if (countdownElement) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      countdownElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Cancel edit due to timeout
   */
  cancelEditDueToTimeout() {
    this.stopEditTimer();
    alert('Edit time expired. Please try again.');
    
    // Force update greeting to restore original state
    const greetingElement = this.container.querySelector('.greeting-message');
    if (greetingElement) {
      greetingElement.textContent = `${this.getGreeting()}, ${this.username}`;
    }
  }

  /**
   * Get remaining edit time in seconds
   * @returns {number} Remaining seconds
   */
  getRemainingEditTime() {
    if (!this.editStartTime) {
      return 0;
    }
    const elapsed = Date.now() - this.editStartTime;
    const remaining = Math.max(0, this.editTimeLimit - elapsed);
    return Math.ceil(remaining / 1000);
  }

  /**
   * Cleanup timers
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.stopEditTimer();
  }
}

export default GreetingDisplay;
