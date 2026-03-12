# Productivity Dashboard

A productivity dashboard web app that provides essential productivity tools including time management, task tracking, and quick access to frequently used resources.

## Project Structure

```
productivity-dashboard/
├── index.html           # Main HTML structure with component containers
├── styles.css           # Application styling
├── app.js               # Main application initialization
├── components/          # Component modules (to be implemented)
├── utils/
│   └── storage.js       # StorageManager utility for Local Storage operations
└── tests/
    └── unit/            # Unit tests
        └── storage.test.js
```

## Features

- **Greeting Display**: Time-based personalized greeting
- **Timer Widget**: Focus timer for Pomodoro technique
- **Task Manager**: To-do list with persistence
- **Quick Links**: Favorite website shortcuts
- **Theme Controller**: Light/dark mode switching

## Storage Manager

The StorageManager utility provides a unified interface for Local Storage operations with:

- `get(key, defaultValue)` - Get data from storage with optional default
- `set(key, value)` - Save data to storage (auto-serializes objects)
- `remove(key)` - Remove data from storage
- `clear()` - Clear all application data
- `isAvailable()` - Check if storage is available

### Error Handling

- Detects Local Storage unavailability and falls back to in-memory storage
- Handles QuotaExceededError on write operations
- Handles JSON parse errors for corrupted data
- Provides user notifications for storage issues

## Development

### Testing

```bash
npm install
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Technology Stack

- Vanilla HTML, CSS, and JavaScript (ES6 modules)
- No external dependencies for core functionality
- Vitest for testing