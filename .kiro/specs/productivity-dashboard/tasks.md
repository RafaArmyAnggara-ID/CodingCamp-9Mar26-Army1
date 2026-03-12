# Implementation Plan: Productivity Dashboard

## Overview

This plan implements a productivity dashboard web application using vanilla HTML, CSS, and JavaScript. The implementation follows a component-based architecture with five main widgets (Greeting, Timer, Tasks, Quick Links, Theme) that share a common Local Storage persistence layer. The application runs entirely client-side with no external dependencies.

## Tasks

- [x] 1. Set up project structure and storage foundation
  - Create directory structure (components/, utils/)
  - Create index.html with basic structure and component containers
  - Implement StorageManager utility class with get/set/remove/clear/isAvailable methods
  - Add error handling for storage unavailability and quota exceeded
  - _Requirements: 3.6, 3.7, 4.6, 4.7, 5.4, 5.5, 9.1, 9.3, 9.4_

- [ ]* 1.1 Write property test for storage data integrity
  - **Property 24: Storage Data Integrity**
  - **Validates: Requirements 3.6, 4.6, 5.4**

- [x] 2. Implement Greeting Display component
  - [x] 2.1 Create GreetingDisplay class with init/updateTime/getGreeting/setUsername methods
    - Implement time-based greeting logic (morning/afternoon/evening/night)
    - Format date display with day, month, year
    - Update time display every second
    - Load custom username from storage
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 2.2 Write property test for date display components
    - **Property 1: Date Display Contains Required Components**
    - **Validates: Requirements 1.1**

  - [ ]* 2.3 Write property test for time-based greeting correctness
    - **Property 2: Time-Based Greeting Correctness**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

  - [ ]* 2.4 Write property test for custom name inclusion
    - **Property 3: Custom Name Inclusion**
    - **Validates: Requirements 1.7**

- [x] 3. Implement Timer Widget component
  - [x] 3.1 Create TimerWidget class with init/start/stop/reset/tick/setDuration methods
    - Implement countdown logic with 25-minute default
    - Handle start/stop/reset button interactions
    - Display timer in MM:SS format
    - Show completion notification when timer reaches zero
    - Support custom duration configuration (1-120 minutes)
    - Persist custom duration to storage
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 3.2 Write property test for timer countdown progression
    - **Property 4: Timer Countdown Progression**
    - **Validates: Requirements 2.6**

  - [ ]* 3.3 Write property test for timer start behavior
    - **Property 5: Timer Start Initiates Countdown**
    - **Validates: Requirements 2.2**

  - [ ]* 3.4 Write property test for timer stop preserves state
    - **Property 6: Timer Stop Preserves State**
    - **Validates: Requirements 2.3**

  - [ ]* 3.5 Write property test for timer reset
    - **Property 7: Timer Reset Restores Initial Duration**
    - **Validates: Requirements 2.4**

  - [ ]* 3.6 Write property test for custom timer duration
    - **Property 8: Custom Timer Duration**
    - **Validates: Requirements 2.7**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Task Manager component
  - [x] 5.1 Create TaskManager class with init/addTask/editTask/toggleTask/deleteTask/render/save methods
    - Implement task data model with id, text, completed, createdAt, updatedAt
    - Generate UUIDs for task IDs
    - Validate task text (non-empty after trim, max 500 chars)
    - Render task list to DOM with checkboxes and action buttons
    - Handle add/edit/toggle/delete operations
    - Persist tasks to storage after each operation
    - Load tasks from storage on initialization
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 5.2 Write property test for task addition
    - **Property 9: Task Addition Increases List Size**
    - **Validates: Requirements 3.1**

  - [ ]* 5.3 Write property test for task list rendering
    - **Property 10: Task List Rendering Completeness**
    - **Validates: Requirements 3.2**

  - [ ]* 5.4 Write property test for task edit
    - **Property 11: Task Edit Updates Text**
    - **Validates: Requirements 3.3**

  - [ ]* 5.5 Write property test for task toggle
    - **Property 12: Task Toggle Flips Completion Status**
    - **Validates: Requirements 3.4**

  - [ ]* 5.6 Write property test for task deletion
    - **Property 13: Task Deletion Removes From List**
    - **Validates: Requirements 3.5**

  - [ ]* 5.7 Write property test for task storage round-trip
    - **Property 14: Task Storage Round-Trip Preservation**
    - **Validates: Requirements 3.6, 3.7**

  - [ ]* 5.8 Write property test for task text validation
    - **Property 23: Task Text Validation**
    - **Validates: Requirements 3.1**

- [x] 6. Implement Quick Links component
  - [x] 6.1 Create QuickLinks class with init/addLink/editLink/deleteLink/openLink/render/save/validateUrl methods
    - Implement link data model with id, name, url, createdAt, updatedAt
    - Generate UUIDs for link IDs
    - Validate URL format (must start with http:// or https://)
    - Validate link name (non-empty after trim, max 50 chars)
    - Render links grid to DOM with buttons and action controls
    - Handle add/edit/delete operations
    - Open links in new tab when clicked
    - Persist links to storage after each operation
    - Load links from storage on initialization
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 6.2 Write property test for link addition
    - **Property 15: Link Addition Increases List Size**
    - **Validates: Requirements 4.2**

  - [ ]* 6.3 Write property test for link list rendering
    - **Property 16: Link List Rendering Completeness**
    - **Validates: Requirements 4.1**

  - [ ]* 6.4 Write property test for link edit
    - **Property 17: Link Edit Updates Data**
    - **Validates: Requirements 4.4**

  - [ ]* 6.5 Write property test for link deletion
    - **Property 18: Link Deletion Removes From List**
    - **Validates: Requirements 4.5**

  - [ ]* 6.6 Write property test for link storage round-trip
    - **Property 19: Link Storage Round-Trip Preservation**
    - **Validates: Requirements 4.6, 4.7**

  - [ ]* 6.7 Write property test for URL validation
    - **Property 22: URL Validation Correctness**
    - **Validates: Requirements 4.2**

- [x] 7. Implement Theme Controller component
  - [x] 7.1 Create ThemeController class with init/toggle/applyTheme/getSystemTheme/save methods
    - Implement theme toggle between light and dark modes
    - Apply theme by adding/removing CSS class on document root
    - Detect system theme preference as fallback
    - Persist theme preference to storage
    - Load saved theme on initialization
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 7.2 Write property test for theme toggle idempotence
    - **Property 20: Theme Toggle Idempotence**
    - **Validates: Requirements 5.2**

  - [ ]* 7.3 Write property test for theme storage round-trip
    - **Property 21: Theme Storage Round-Trip Preservation**
    - **Validates: Requirements 5.4, 5.5**

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create styles and visual design
  - [x] 9.1 Create styles.css with component styles and theme variables
    - Define CSS custom properties for light and dark themes
    - Style all components (greeting, timer, tasks, links, theme toggle)
    - Implement responsive layout with flexbox/grid
    - Add visual feedback for interactive elements (hover, focus, active states)
    - Ensure proper contrast ratios for accessibility
    - Add smooth transitions for theme switching
    - _Requirements: 5.3, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 10. Wire components together in main application
  - [x] 10.1 Create app.js to initialize all components
    - Initialize StorageManager and check availability
    - Instantiate all component classes with their container elements
    - Call init() on each component in proper order
    - Add error handling for component initialization failures
    - Display warning banner if storage is unavailable
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 9.1, 9.2, 9.3, 9.4_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The application uses vanilla JavaScript with no external dependencies for core functionality
- Property-based tests use fast-check library and should run 100+ iterations per property
- All components follow the same lifecycle: init → render → event binding → state updates → persistence
- Storage operations include error handling for unavailability, quota exceeded, and corruption scenarios
- Cross-browser compatibility testing should be performed manually in Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
