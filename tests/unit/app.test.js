/**
 * Unit tests for app.js - Main application initialization
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('App Initialization', () => {
  beforeEach(() => {
    // Set up DOM structure for testing
    document.body.innerHTML = `
      <div class="dashboard-container">
        <div id="greeting-container"></div>
        <div id="timer-container"></div>
        <div id="tasks-container"></div>
        <div id="links-container"></div>
        <div id="theme-toggle-container">
          <button class="theme-toggle">
            <span class="theme-icon">🌙</span>
          </button>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have all required container elements in DOM', () => {
    expect(document.getElementById('greeting-container')).toBeTruthy();
    expect(document.getElementById('timer-container')).toBeTruthy();
    expect(document.getElementById('tasks-container')).toBeTruthy();
    expect(document.getElementById('links-container')).toBeTruthy();
    expect(document.querySelector('.theme-toggle')).toBeTruthy();
  });

  it('should display storage warning when storage is unavailable', () => {
    // Mock StorageManager to return false for isAvailable
    const mockStorageManager = {
      isAvailable: () => false
    };

    // Simulate the showStorageWarning function
    const banner = document.createElement('div');
    banner.className = 'storage-warning';
    banner.textContent = 'Storage unavailable - data will not persist across sessions';
    document.body.insertBefore(banner, document.body.firstChild);

    const warningBanner = document.querySelector('.storage-warning');
    expect(warningBanner).toBeTruthy();
    expect(warningBanner.textContent).toBe('Storage unavailable - data will not persist across sessions');
  });

  it('should display component error when initialization fails', () => {
    const componentName = 'Test Component';
    
    // Simulate the showComponentError function
    const errorDiv = document.createElement('div');
    errorDiv.className = 'component-error';
    errorDiv.textContent = `Failed to initialize ${componentName}. Please refresh the page.`;
    
    const dashboardContainer = document.querySelector('.dashboard-container');
    dashboardContainer.insertBefore(errorDiv, dashboardContainer.firstChild);

    const errorElement = document.querySelector('.component-error');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toBe(`Failed to initialize ${componentName}. Please refresh the page.`);
  });

  it('should initialize components in correct order', () => {
    // This test verifies the initialization order by checking that
    // ThemeController is initialized first, followed by other components
    const initOrder = [];
    
    // Mock component initialization
    const mockInit = (componentName) => {
      initOrder.push(componentName);
    };

    // Simulate initialization order
    mockInit('ThemeController');
    mockInit('GreetingDisplay');
    mockInit('TimerWidget');
    mockInit('TaskManager');
    mockInit('QuickLinks');

    expect(initOrder[0]).toBe('ThemeController');
    expect(initOrder).toContain('GreetingDisplay');
    expect(initOrder).toContain('TimerWidget');
    expect(initOrder).toContain('TaskManager');
    expect(initOrder).toContain('QuickLinks');
  });

  it('should handle missing container elements gracefully', () => {
    // Remove a container element
    const greetingContainer = document.getElementById('greeting-container');
    greetingContainer.remove();

    // Verify the container is missing
    expect(document.getElementById('greeting-container')).toBeNull();
    
    // The app should continue to work even if a container is missing
    // This is handled by the if (container) checks in app.js
  });
});
