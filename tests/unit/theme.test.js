import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ThemeController from '../../components/theme.js';
import StorageManager from '../../utils/storage.js';

describe('ThemeController', () => {
  let themeController;
  let toggleButton;

  beforeEach(() => {
    // Create toggle button element
    toggleButton = document.createElement('button');
    toggleButton.className = 'theme-toggle';
    toggleButton.innerHTML = '<span class="theme-icon">🌙</span>';
    document.body.appendChild(toggleButton);

    // Mock StorageManager
    vi.spyOn(StorageManager, 'get').mockReturnValue(null);
    vi.spyOn(StorageManager, 'set').mockReturnValue(true);

    // Mock matchMedia for system theme detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    if (toggleButton && toggleButton.parentNode) {
      document.body.removeChild(toggleButton);
    }
    document.documentElement.classList.remove('dark-theme');
    vi.restoreAllMocks();
  });

  describe('init', () => {
    it('should initialize with light theme when no saved preference', () => {
      themeController = new ThemeController();
      themeController.init();

      expect(themeController.currentTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
    });

    it('should load saved theme from storage', () => {
      StorageManager.get.mockReturnValue('dark');

      themeController = new ThemeController();
      themeController.init();

      expect(StorageManager.get).toHaveBeenCalledWith('dashboard_theme');
      expect(themeController.currentTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    });

    it('should use system theme when no saved preference', () => {
      window.matchMedia.mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      themeController = new ThemeController();
      themeController.init();

      expect(themeController.currentTheme).toBe('dark');
    });

    it('should ignore invalid saved theme values', () => {
      StorageManager.get.mockReturnValue('invalid-theme');

      themeController = new ThemeController();
      themeController.init();

      expect(themeController.currentTheme).toBe('light');
    });

    it('should attach click listener to toggle button', () => {
      themeController = new ThemeController();
      themeController.init();

      const toggleSpy = vi.spyOn(themeController, 'toggle');
      toggleButton.click();

      expect(toggleSpy).toHaveBeenCalled();
    });

    it('should handle missing toggle button gracefully', () => {
      document.body.removeChild(toggleButton);

      themeController = new ThemeController();
      
      expect(() => themeController.init()).not.toThrow();
    });
  });

  describe('toggle', () => {
    beforeEach(() => {
      themeController = new ThemeController();
      themeController.init();
    });

    it('should switch from light to dark', () => {
      themeController.currentTheme = 'light';
      
      themeController.toggle();

      expect(themeController.currentTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    });

    it('should switch from dark to light', () => {
      themeController.currentTheme = 'dark';
      themeController.applyTheme('dark');
      
      themeController.toggle();

      expect(themeController.currentTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
    });

    it('should save theme after toggling', () => {
      themeController.toggle();

      expect(StorageManager.set).toHaveBeenCalledWith('dashboard_theme', 'dark');
    });

    it('should update toggle button icon', () => {
      const icon = toggleButton.querySelector('.theme-icon');
      
      themeController.toggle(); // light -> dark
      expect(icon.textContent).toBe('☀️');
      
      themeController.toggle(); // dark -> light
      expect(icon.textContent).toBe('🌙');
    });
  });

  describe('applyTheme', () => {
    beforeEach(() => {
      themeController = new ThemeController();
      themeController.init();
    });

    it('should add dark-theme class for dark theme', () => {
      themeController.applyTheme('dark');

      expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
      expect(themeController.currentTheme).toBe('dark');
    });

    it('should remove dark-theme class for light theme', () => {
      document.documentElement.classList.add('dark-theme');
      
      themeController.applyTheme('light');

      expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
      expect(themeController.currentTheme).toBe('light');
    });

    it('should update toggle button icon to sun for dark theme', () => {
      const icon = toggleButton.querySelector('.theme-icon');
      
      themeController.applyTheme('dark');

      expect(icon.textContent).toBe('☀️');
    });

    it('should update toggle button icon to moon for light theme', () => {
      const icon = toggleButton.querySelector('.theme-icon');
      
      themeController.applyTheme('light');

      expect(icon.textContent).toBe('🌙');
    });

    it('should handle missing toggle button gracefully', () => {
      document.body.removeChild(toggleButton);
      themeController.toggleButton = null;

      expect(() => themeController.applyTheme('dark')).not.toThrow();
    });

    it('should handle missing icon element gracefully', () => {
      toggleButton.innerHTML = ''; // Remove icon
      
      expect(() => themeController.applyTheme('dark')).not.toThrow();
    });
  });

  describe('getSystemTheme', () => {
    it('should return dark when system prefers dark', () => {
      window.matchMedia.mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
      }));

      themeController = new ThemeController();
      const systemTheme = themeController.getSystemTheme();

      expect(systemTheme).toBe('dark');
    });

    it('should return light when system prefers light', () => {
      window.matchMedia.mockImplementation(query => ({
        matches: false,
        media: query,
      }));

      themeController = new ThemeController();
      const systemTheme = themeController.getSystemTheme();

      expect(systemTheme).toBe('light');
    });

    it('should return light when matchMedia is not available', () => {
      window.matchMedia = undefined;

      themeController = new ThemeController();
      const systemTheme = themeController.getSystemTheme();

      expect(systemTheme).toBe('light');
    });
  });

  describe('save', () => {
    beforeEach(() => {
      themeController = new ThemeController();
      themeController.init();
    });

    it('should save current theme to storage', () => {
      themeController.currentTheme = 'dark';
      
      themeController.save();

      expect(StorageManager.set).toHaveBeenCalledWith('dashboard_theme', 'dark');
    });

    it('should save light theme correctly', () => {
      themeController.currentTheme = 'light';
      
      themeController.save();

      expect(StorageManager.set).toHaveBeenCalledWith('dashboard_theme', 'light');
    });
  });

  describe('integration scenarios', () => {
    it('should persist theme across page reloads', () => {
      // First session
      themeController = new ThemeController();
      themeController.init();
      themeController.toggle(); // Switch to dark

      expect(StorageManager.set).toHaveBeenCalledWith('dashboard_theme', 'dark');

      // Simulate page reload
      StorageManager.get.mockReturnValue('dark');
      const newController = new ThemeController();
      newController.init();

      expect(newController.currentTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    });

    it('should handle rapid toggle clicks', () => {
      themeController = new ThemeController();
      themeController.init();

      themeController.toggle(); // light -> dark
      themeController.toggle(); // dark -> light
      themeController.toggle(); // light -> dark

      expect(themeController.currentTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    });

    it('should work without toggle button in DOM', () => {
      document.body.removeChild(toggleButton);

      themeController = new ThemeController();
      themeController.init();
      
      expect(() => {
        themeController.toggle();
        themeController.applyTheme('dark');
      }).not.toThrow();
    });
  });
});
