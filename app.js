/**
 * Main application initialization
 */
import StorageManager from './utils/storage.js';
import ThemeController from './components/theme.js';
import GreetingDisplay from './components/greeting.js';
import TimerWidget from './components/timer.js';
import TaskManager from './components/tasks.js';
import QuickLinks from './components/quickLinks.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Productivity Dashboard initialized');
  
  // Check storage availability and notify user if unavailable
  if (!StorageManager.isAvailable()) {
    showStorageWarning();
  }
  
  // Initialize components with error handling
  try {
    // Initialize Theme Controller first (affects visual appearance of all components)
    const themeController = new ThemeController();
    themeController.init();
    console.log('Theme Controller initialized');
  } catch (error) {
    console.error('Failed to initialize Theme Controller:', error);
    showComponentError('Theme Controller');
  }
  
  try {
    // Initialize Greeting Display
    const greetingContainer = document.getElementById('greeting-container');
    if (greetingContainer) {
      const greetingDisplay = new GreetingDisplay(greetingContainer);
      greetingDisplay.init();
      console.log('Greeting Display initialized');
    } else {
      console.warn('Greeting container not found');
    }
  } catch (error) {
    console.error('Failed to initialize Greeting Display:', error);
    showComponentError('Greeting Display');
  }
  
  try {
    // Initialize Timer Widget
    const timerContainer = document.getElementById('timer-container');
    if (timerContainer) {
      const timerWidget = new TimerWidget(timerContainer);
      timerWidget.init();
      console.log('Timer Widget initialized');
    } else {
      console.warn('Timer container not found');
    }
  } catch (error) {
    console.error('Failed to initialize Timer Widget:', error);
    showComponentError('Timer Widget');
  }
  
  try {
    // Initialize Task Manager
    const tasksContainer = document.getElementById('tasks-container');
    if (tasksContainer) {
      const taskManager = new TaskManager(tasksContainer);
      taskManager.init();
      console.log('Task Manager initialized');
    } else {
      console.warn('Tasks container not found');
    }
  } catch (error) {
    console.error('Failed to initialize Task Manager:', error);
    showComponentError('Task Manager');
  }
  
  try {
    // Initialize Quick Links
    const linksContainer = document.getElementById('links-container');
    if (linksContainer) {
      const quickLinks = new QuickLinks(linksContainer);
      quickLinks.init();
      console.log('Quick Links initialized');
    } else {
      console.warn('Links container not found');
    }
  } catch (error) {
    console.error('Failed to initialize Quick Links:', error);
    showComponentError('Quick Links');
  }
  
  console.log('All components initialized successfully');
});

/**
 * Display warning banner when storage is unavailable
 */
function showStorageWarning() {
  const banner = document.createElement('div');
  banner.className = 'storage-warning';
  banner.textContent = 'Storage unavailable - data will not persist across sessions';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #ff9800;
    color: #000;
    padding: 10px;
    text-align: center;
    z-index: 1000;
    font-weight: bold;
  `;
  document.body.insertBefore(banner, document.body.firstChild);
}

/**
 * Display error message when a component fails to initialize
 * @param {string} componentName - Name of the component that failed
 */
function showComponentError(componentName) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'component-error';
  errorDiv.textContent = `Failed to initialize ${componentName}. Please refresh the page.`;
  errorDiv.style.cssText = `
    background-color: #f44336;
    color: #fff;
    padding: 10px;
    margin: 10px;
    border-radius: 4px;
    text-align: center;
  `;
  
  const dashboardContainer = document.querySelector('.dashboard-container');
  if (dashboardContainer) {
    dashboardContainer.insertBefore(errorDiv, dashboardContainer.firstChild);
  } else {
    document.body.appendChild(errorDiv);
  }
}
