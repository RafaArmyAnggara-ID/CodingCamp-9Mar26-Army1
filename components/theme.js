import StorageManager from '../utils/storage.js';

/**
 * ThemeController - Manages theme switching between light and dark modes
 */
class ThemeController {
  constructor() {
    this.currentTheme = null;
    this.toggleButton = null;
    this.storageKey = 'dashboard_theme';
  }

  /**
   * Initialize theme from storage or system preference
   */
  init() {
    // Load saved theme or detect system preference
    const savedTheme = StorageManager.get(this.storageKey);
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = this.getSystemTheme();
    }

    // Apply the theme
    this.applyTheme(this.currentTheme);

    // Set up toggle button if it exists
    this.toggleButton = document.querySelector('.theme-toggle');
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => this.toggle());
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggle() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    this.save();
  }

  /**
   * Apply theme to document
   * @param {string} theme - Theme to apply ('light' or 'dark')
   */
  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }

    // Update toggle button icon if it exists
    if (this.toggleButton) {
      const icon = this.toggleButton.querySelector('.theme-icon');
      if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
    }

    this.currentTheme = theme;
  }

  /**
   * Get system theme preference
   * @returns {string} 'light' or 'dark'
   */
  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Save theme preference to storage
   */
  save() {
    StorageManager.set(this.storageKey, this.currentTheme);
  }
}

export default ThemeController;
