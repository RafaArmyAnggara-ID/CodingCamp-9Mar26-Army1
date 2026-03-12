# Design Document: Productivity Dashboard

## Overview

The productivity dashboard is a single-page web application built with vanilla HTML, CSS, and JavaScript that provides essential productivity tools in a unified interface. The application architecture follows a component-based approach where each widget (greeting, timer, tasks, quick links, theme) operates independently while sharing a common data persistence layer through the browser's Local Storage API.

The application is designed to run entirely client-side with no server dependencies, making it suitable for both standalone HTML file usage and browser extension deployment. All state management and data persistence happens locally, ensuring privacy and offline functionality.

### Key Design Principles

- **Zero Dependencies**: Pure vanilla JavaScript with no frameworks or libraries
- **Component Isolation**: Each widget is self-contained with its own state and DOM management
- **Local-First**: All data stored in browser Local Storage for privacy and offline access
- **Progressive Enhancement**: Core functionality works without advanced browser features
- **Responsive Design**: Adapts to different viewport sizes while maintaining usability

## Architecture

### System Structure

The application follows a modular architecture with clear separation between presentation, business logic, and data persistence:

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │              Dashboard Container                   │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │ │
│  │  │ Greeting │ │  Timer   │ │  Tasks   │          │ │
│  │  │ Display  │ │  Widget  │ │ Manager  │          │ │
│  │  └──────────┘ └──────────┘ └──────────┘          │ │
│  │  ┌──────────┐ ┌──────────┐                       │ │
│  │  │  Quick   │ │  Theme   │                       │ │
│  │  │  Links   │ │Controller│                       │ │
│  │  └──────────┘ └──────────┘                       │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Storage Manager    │
              │  (LocalStorage API)  │
              └──────────────────────┘
```

### Component Lifecycle

Each component follows a consistent lifecycle pattern:

1. **Initialization**: Component reads configuration and state from Local Storage
2. **Rendering**: Component creates or updates its DOM representation
3. **Event Binding**: Component attaches event listeners for user interactions
4. **State Updates**: Component responds to user actions by updating internal state
5. **Persistence**: Component saves state changes to Local Storage
6. **Cleanup**: Component removes event listeners when necessary (for dynamic components)

### File Structure

```
productivity-dashboard/
├── index.html           # Main HTML structure
├── styles.css           # All styling including themes
├── app.js               # Main application initialization
├── components/
│   ├── greeting.js      # Greeting display component
│   ├── timer.js         # Focus timer component
│   ├── tasks.js         # Task manager component
│   ├── quickLinks.js    # Quick links component
│   └── theme.js         # Theme controller component
└── utils/
    └── storage.js       # Local Storage abstraction layer
```

## Components and Interfaces

### Storage Manager

The Storage Manager provides a unified interface for all Local Storage operations with error handling and data validation.

**Interface:**
```javascript
class StorageManager {
  // Get data from storage with optional default value
  static get(key, defaultValue = null)
  
  // Save data to storage (automatically serializes objects)
  static set(key, value)
  
  // Remove data from storage
  static remove(key)
  
  // Clear all application data
  static clear()
  
  // Check if storage is available
  static isAvailable()
}
```

**Storage Keys:**
- `dashboard_theme`: Current theme ('light' or 'dark')
- `dashboard_username`: User's custom name for greeting
- `dashboard_timer_duration`: Custom timer duration in seconds
- `dashboard_tasks`: Array of task objects
- `dashboard_links`: Array of quick link objects

### Greeting Display Component

Displays time-based greeting with current date and time.

**Interface:**
```javascript
class GreetingDisplay {
  constructor(containerElement)
  
  // Initialize component and start clock
  init()
  
  // Update time display (called every second)
  updateTime()
  
  // Get appropriate greeting based on current hour
  getGreeting()
  
  // Set custom username
  setUsername(name)
  
  // Cleanup timers
  destroy()
}
```

**DOM Structure:**
```html
<div class="greeting-container">
  <h1 class="greeting-message">Good Morning, [Name]</h1>
  <div class="date-display">Monday, January 1, 2024</div>
  <div class="time-display">10:30:45 AM</div>
</div>
```

### Timer Widget Component

Implements a countdown timer for focus sessions (Pomodoro technique).

**Interface:**
```javascript
class TimerWidget {
  constructor(containerElement)
  
  // Initialize timer with saved or default duration
  init()
  
  // Start countdown
  start()
  
  // Pause countdown
  stop()
  
  // Reset to initial duration
  reset()
  
  // Update display (called every second while running)
  tick()
  
  // Handle timer completion
  onComplete()
  
  // Set custom duration (in minutes)
  setDuration(minutes)
  
  // Cleanup timers
  destroy()
}
```

**State:**
- `duration`: Total duration in seconds
- `remaining`: Remaining time in seconds
- `isRunning`: Boolean indicating if timer is active
- `intervalId`: Reference to setInterval for cleanup

**DOM Structure:**
```html
<div class="timer-container">
  <div class="timer-display">25:00</div>
  <div class="timer-controls">
    <button class="btn-start">Start</button>
    <button class="btn-stop">Stop</button>
    <button class="btn-reset">Reset</button>
  </div>
  <div class="timer-settings">
    <input type="number" class="duration-input" min="1" max="120" />
    <button class="btn-set-duration">Set Duration</button>
  </div>
</div>
```

### Task Manager Component

Manages a list of tasks with add, edit, complete, and delete operations.

**Interface:**
```javascript
class TaskManager {
  constructor(containerElement)
  
  // Initialize and render tasks from storage
  init()
  
  // Add new task
  addTask(text)
  
  // Update task text
  editTask(taskId, newText)
  
  // Toggle task completion status
  toggleTask(taskId)
  
  // Delete task
  deleteTask(taskId)
  
  // Render all tasks to DOM
  render()
  
  // Save tasks to storage
  save()
}
```

**DOM Structure:**
```html
<div class="tasks-container">
  <div class="task-input-section">
    <input type="text" class="task-input" placeholder="Add a new task..." />
    <button class="btn-add-task">Add</button>
  </div>
  <ul class="task-list">
    <li class="task-item" data-task-id="uuid">
      <input type="checkbox" class="task-checkbox" />
      <span class="task-text">Task description</span>
      <button class="btn-edit-task">Edit</button>
      <button class="btn-delete-task">Delete</button>
    </li>
  </ul>
</div>
```

### Quick Links Component

Manages a collection of website shortcuts with add, edit, and delete operations.

**Interface:**
```javascript
class QuickLinks {
  constructor(containerElement)
  
  // Initialize and render links from storage
  init()
  
  // Add new link
  addLink(name, url)
  
  // Update link
  editLink(linkId, name, url)
  
  // Delete link
  deleteLink(linkId)
  
  // Open link in new tab
  openLink(url)
  
  // Render all links to DOM
  render()
  
  // Save links to storage
  save()
  
  // Validate URL format
  validateUrl(url)
}
```

**DOM Structure:**
```html
<div class="links-container">
  <div class="link-input-section">
    <input type="text" class="link-name-input" placeholder="Name" />
    <input type="url" class="link-url-input" placeholder="https://..." />
    <button class="btn-add-link">Add Link</button>
  </div>
  <div class="links-grid">
    <div class="link-item" data-link-id="uuid">
      <button class="link-button">Link Name</button>
      <div class="link-actions">
        <button class="btn-edit-link">Edit</button>
        <button class="btn-delete-link">Delete</button>
      </div>
    </div>
  </div>
</div>
```

### Theme Controller Component

Manages theme switching between light and dark modes.

**Interface:**
```javascript
class ThemeController {
  constructor()
  
  // Initialize theme from storage or system preference
  init()
  
  // Toggle between light and dark themes
  toggle()
  
  // Apply theme to document
  applyTheme(theme)
  
  // Get system theme preference
  getSystemTheme()
  
  // Save theme preference
  save()
}
```

**DOM Structure:**
```html
<div class="theme-toggle-container">
  <button class="theme-toggle" aria-label="Toggle theme">
    <span class="theme-icon">🌙</span>
  </button>
</div>
```

## Data Models

### Task Object

```javascript
{
  id: string,           // UUID v4 format
  text: string,         // Task description (1-500 characters)
  completed: boolean,   // Completion status
  createdAt: number,    // Unix timestamp (milliseconds)
  updatedAt: number     // Unix timestamp (milliseconds)
}
```

**Validation Rules:**
- `id`: Must be unique UUID
- `text`: Required, non-empty after trimming, max 500 characters
- `completed`: Boolean, defaults to false
- `createdAt`: Positive integer, set on creation
- `updatedAt`: Positive integer, updated on any modification

### Quick Link Object

```javascript
{
  id: string,           // UUID v4 format
  name: string,         // Display name (1-50 characters)
  url: string,          // Valid URL with protocol
  createdAt: number,    // Unix timestamp (milliseconds)
  updatedAt: number     // Unix timestamp (milliseconds)
}
```

**Validation Rules:**
- `id`: Must be unique UUID
- `name`: Required, non-empty after trimming, max 50 characters
- `url`: Required, must be valid URL with http:// or https:// protocol
- `createdAt`: Positive integer, set on creation
- `updatedAt`: Positive integer, updated on any modification

### Timer State Object

```javascript
{
  duration: number,     // Duration in seconds (60-7200)
  customDuration: number // User-set duration in seconds (optional)
}
```

**Validation Rules:**
- `duration`: Integer between 60 (1 minute) and 7200 (120 minutes)
- `customDuration`: Optional integer between 60 and 7200

### Theme Preference Object

```javascript
{
  theme: string         // 'light' or 'dark'
}
```

**Validation Rules:**
- `theme`: Must be exactly 'light' or 'dark'

### User Preferences Object

```javascript
{
  username: string      // Custom name for greeting (0-50 characters)
}
```

**Validation Rules:**
- `username`: Optional, max 50 characters, sanitized for XSS prevention


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Date Display Contains Required Components

*For any* point in time, when the greeting display renders the date, the output string should contain the day, month, and year components in a human-readable format.

**Validates: Requirements 1.1**

### Property 2: Time-Based Greeting Correctness

*For any* hour of the day (0-23), the greeting function should return "Good Morning" for hours 5-11, "Good Afternoon" for hours 12-16, "Good Evening" for hours 17-20, and "Good Night" for hours 21-4.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

### Property 3: Custom Name Inclusion

*For any* non-empty custom name string, when the greeting is rendered with that name, the output should contain the exact name string.

**Validates: Requirements 1.7**

### Property 4: Timer Countdown Progression

*For any* timer with remaining time greater than zero, when the tick function is called, the remaining time should decrease by exactly one second.

**Validates: Requirements 2.6**

### Property 5: Timer Start Initiates Countdown

*For any* timer duration, when the timer is started, the isRunning state should be true and subsequent ticks should decrease the remaining time.

**Validates: Requirements 2.2**

### Property 6: Timer Stop Preserves State

*For any* running timer with remaining time T, when stopped, the remaining time should still be T and isRunning should be false.

**Validates: Requirements 2.3**

### Property 7: Timer Reset Restores Initial Duration

*For any* timer state, when reset is called, the remaining time should equal the initial duration and isRunning should be false.

**Validates: Requirements 2.4**

### Property 8: Custom Timer Duration

*For any* valid duration value (60-7200 seconds), when set as the custom duration, the timer should initialize with that duration instead of the default 1500 seconds.

**Validates: Requirements 2.7**

### Property 9: Task Addition Increases List Size

*For any* task list and any valid (non-empty, trimmed) task text, adding the task should increase the list length by exactly one.

**Validates: Requirements 3.1**

### Property 10: Task List Rendering Completeness

*For any* task list, when rendered to DOM, the number of task elements in the DOM should equal the number of tasks in the list.

**Validates: Requirements 3.2**

### Property 11: Task Edit Updates Text

*For any* task in the list and any valid new text, editing the task should result in the task's text property being updated to the new text.

**Validates: Requirements 3.3**

### Property 12: Task Toggle Flips Completion Status

*For any* task in the list, toggling the task should flip its completed status from true to false or false to true.

**Validates: Requirements 3.4**

### Property 13: Task Deletion Removes From List

*For any* task in the list, deleting that task should result in the list no longer containing a task with that ID.

**Validates: Requirements 3.5**

### Property 14: Task Storage Round-Trip Preservation

*For any* valid task list, saving the tasks to storage and then loading them back should produce an equivalent task list with the same tasks (matching IDs, text, and completion status).

**Validates: Requirements 3.6, 3.7**

### Property 15: Link Addition Increases List Size

*For any* link list and any valid name and URL, adding the link should increase the list length by exactly one.

**Validates: Requirements 4.2**

### Property 16: Link List Rendering Completeness

*For any* link list, when rendered to DOM, the number of link elements in the DOM should equal the number of links in the list.

**Validates: Requirements 4.1**

### Property 17: Link Edit Updates Data

*For any* link in the list and any valid new name and URL, editing the link should result in the link's name and url properties being updated to the new values.

**Validates: Requirements 4.4**

### Property 18: Link Deletion Removes From List

*For any* link in the list, deleting that link should result in the list no longer containing a link with that ID.

**Validates: Requirements 4.5**

### Property 19: Link Storage Round-Trip Preservation

*For any* valid link list, saving the links to storage and then loading them back should produce an equivalent link list with the same links (matching IDs, names, and URLs).

**Validates: Requirements 4.6, 4.7**

### Property 20: Theme Toggle Idempotence

*For any* theme state (light or dark), toggling twice should return to the original theme state.

**Validates: Requirements 5.2**

### Property 21: Theme Storage Round-Trip Preservation

*For any* valid theme value ('light' or 'dark'), saving the theme to storage and then loading it back should produce the same theme value.

**Validates: Requirements 5.4, 5.5**

### Property 22: URL Validation Correctness

*For any* string, the URL validation function should return true only if the string starts with 'http://' or 'https://' and contains a valid domain structure.

**Validates: Requirements 4.2** (implicit validation requirement)

### Property 23: Task Text Validation

*For any* string composed entirely of whitespace characters, attempting to add it as a task should be rejected and the task list should remain unchanged.

**Validates: Requirements 3.1** (implicit validation requirement)

### Property 24: Storage Data Integrity

*For any* valid JavaScript object, saving it to storage and immediately retrieving it should produce an equivalent object (deep equality).

**Validates: Requirements 3.6, 4.6, 5.4** (underlying storage mechanism)

## Error Handling

### Storage Errors

**Local Storage Unavailable:**
- Detection: Check `StorageManager.isAvailable()` on initialization
- Fallback: Use in-memory storage with session-only persistence
- User Notification: Display warning banner: "Storage unavailable - data will not persist"

**Storage Quota Exceeded:**
- Detection: Catch `QuotaExceededError` on storage write operations
- Recovery: Attempt to clear old data or reduce storage usage
- User Notification: Display error message: "Storage full - please delete some items"

**Storage Corruption:**
- Detection: JSON parse errors when reading from storage
- Recovery: Clear corrupted key and use default values
- Logging: Log error to console for debugging

### Input Validation Errors

**Invalid Task Text:**
- Validation: Trim and check for non-empty string, max 500 characters
- User Feedback: Disable add button or show inline error message
- Prevention: Use HTML5 input validation attributes

**Invalid URL:**
- Validation: Check for http:// or https:// protocol and basic URL structure
- User Feedback: Show inline error message: "Please enter a valid URL starting with http:// or https://"
- Prevention: Use HTML5 input type="url" with pattern validation

**Invalid Timer Duration:**
- Validation: Check for integer between 1 and 120 minutes
- User Feedback: Clamp to valid range or show error message
- Prevention: Use HTML5 input type="number" with min/max attributes

### Component Errors

**Timer Interval Cleanup:**
- Issue: Memory leaks from uncleaned intervals
- Prevention: Store interval IDs and clear on stop/reset/destroy
- Detection: Track active intervals in component state

**Event Listener Leaks:**
- Issue: Memory leaks from unremoved event listeners
- Prevention: Store listener references and remove on component destroy
- Pattern: Use event delegation where possible to minimize listeners

**DOM Manipulation Errors:**
- Issue: Attempting to manipulate non-existent elements
- Prevention: Check for element existence before manipulation
- Fallback: Log error and gracefully skip operation

### Cross-Browser Compatibility Errors

**Local Storage API:**
- Issue: Some browsers block Local Storage in private mode
- Detection: Try-catch around storage operations
- Fallback: In-memory storage with session persistence

**Date/Time Formatting:**
- Issue: Different browsers format dates differently
- Solution: Use explicit formatting with Intl.DateTimeFormat or manual formatting
- Testing: Test across target browsers

**CSS Feature Support:**
- Issue: Older browsers may not support CSS custom properties
- Solution: Provide fallback values in CSS
- Detection: Use @supports queries where necessary

## Testing Strategy

### Unit Testing Approach

The application will use a dual testing strategy combining traditional unit tests with property-based tests for comprehensive coverage.

**Unit Test Focus Areas:**
- Specific examples demonstrating correct behavior
- Edge cases (empty lists, boundary values, zero states)
- Error conditions (invalid inputs, storage failures)
- Integration points between components and storage layer

**Property-Based Test Focus Areas:**
- Universal properties that hold for all valid inputs
- Round-trip properties (serialization, state preservation)
- Invariant properties (list operations, state transitions)
- Metamorphic properties (idempotence, commutativity)

### Property-Based Testing Configuration

**Framework Selection:**
- JavaScript: Use **fast-check** library for property-based testing
- Installation: `npm install --save-dev fast-check`
- Integration: Works with standard test runners (Jest, Mocha, Vitest)

**Test Configuration:**
- Minimum 100 iterations per property test (configurable via `fc.assert` options)
- Each property test must include a comment tag referencing the design property
- Tag format: `// Feature: productivity-dashboard, Property {number}: {property_text}`

**Example Property Test Structure:**
```javascript
import fc from 'fast-check';

// Feature: productivity-dashboard, Property 2: Time-Based Greeting Correctness
test('greeting matches time range for any hour', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
      const greeting = getGreeting(hour);
      if (hour >= 5 && hour <= 11) {
        return greeting === 'Good Morning';
      } else if (hour >= 12 && hour <= 16) {
        return greeting === 'Good Afternoon';
      } else if (hour >= 17 && hour <= 20) {
        return greeting === 'Good Evening';
      } else {
        return greeting === 'Good Night';
      }
    }),
    { numRuns: 100 }
  );
});
```

### Test Organization

```
tests/
├── unit/
│   ├── greeting.test.js       # Unit tests for greeting component
│   ├── timer.test.js          # Unit tests for timer component
│   ├── tasks.test.js          # Unit tests for task manager
│   ├── quickLinks.test.js     # Unit tests for quick links
│   ├── theme.test.js          # Unit tests for theme controller
│   └── storage.test.js        # Unit tests for storage manager
├── properties/
│   ├── greeting.properties.js  # Property tests for greeting
│   ├── timer.properties.js     # Property tests for timer
│   ├── tasks.properties.js     # Property tests for tasks
│   ├── links.properties.js     # Property tests for links
│   ├── theme.properties.js     # Property tests for theme
│   └── storage.properties.js   # Property tests for storage
└── integration/
    └── dashboard.test.js       # Integration tests for full dashboard
```

### Testing Guidelines

**Unit Test Balance:**
- Focus unit tests on specific examples and edge cases
- Avoid writing many similar unit tests for the same behavior
- Use property tests to cover comprehensive input ranges
- Unit tests should validate specific scenarios that demonstrate correctness

**Property Test Design:**
- Each correctness property from the design should have exactly one property test
- Use appropriate generators for input data (fc.string(), fc.integer(), etc.)
- Include shrinking for better failure reporting
- Test invariants that should hold across all valid inputs

**Mock Strategy:**
- Mock Local Storage API for isolated component testing
- Mock Date/Time for deterministic greeting tests
- Mock window.open for link opening tests
- Use dependency injection where possible for easier mocking

**Coverage Goals:**
- Aim for 90%+ code coverage across all components
- 100% coverage of error handling paths
- All correctness properties must have corresponding property tests
- All edge cases identified in requirements must have unit tests

### Browser Testing

**Manual Testing Required:**
- Cross-browser compatibility (Chrome, Firefox, Edge, Safari)
- Visual appearance in both light and dark themes
- Responsive behavior at different viewport sizes
- Accessibility with keyboard navigation and screen readers

**Automated Browser Testing:**
- Consider Playwright or Cypress for integration tests
- Test critical user flows (add task, start timer, add link)
- Test Local Storage persistence across page reloads
- Test theme persistence across sessions
