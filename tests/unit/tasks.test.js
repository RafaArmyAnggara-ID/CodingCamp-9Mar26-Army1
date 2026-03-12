import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TaskManager from '../../components/tasks.js';
import StorageManager from '../../utils/storage.js';

describe('TaskManager', () => {
  let container;
  let taskManager;

  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Mock StorageManager
    vi.spyOn(StorageManager, 'get').mockReturnValue([]);
    vi.spyOn(StorageManager, 'set').mockReturnValue(true);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  describe('init', () => {
    it('should create DOM structure with input section and task list', () => {
      taskManager = new TaskManager(container);
      taskManager.init();

      expect(container.querySelector('.tasks-container')).toBeTruthy();
      expect(container.querySelector('.task-input-section')).toBeTruthy();
      expect(container.querySelector('.task-input')).toBeTruthy();
      expect(container.querySelector('.btn-add-task')).toBeTruthy();
      expect(container.querySelector('.task-list')).toBeTruthy();
    });

    it('should initialize with empty task list', () => {
      taskManager = new TaskManager(container);
      taskManager.init();

      expect(taskManager.tasks).toEqual([]);
    });

    it('should load tasks from storage', () => {
      const savedTasks = [
        { id: '1', text: 'Task 1', completed: false, createdAt: 1000, updatedAt: 1000 },
        { id: '2', text: 'Task 2', completed: true, createdAt: 2000, updatedAt: 2000 }
      ];
      StorageManager.get.mockReturnValue(savedTasks);
      
      taskManager = new TaskManager(container);
      taskManager.init();

      expect(StorageManager.get).toHaveBeenCalledWith('dashboard_tasks', []);
      expect(taskManager.tasks).toEqual(savedTasks);
    });

    it('should handle corrupted storage data gracefully', () => {
      StorageManager.get.mockReturnValue(null);
      
      taskManager = new TaskManager(container);
      taskManager.init();

      expect(taskManager.tasks).toEqual([]);
    });
  });

  describe('generateUUID', () => {
    beforeEach(() => {
      taskManager = new TaskManager(container);
    });

    it('should generate a valid UUID v4 format', () => {
      const uuid = taskManager.generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = taskManager.generateUUID();
      const uuid2 = taskManager.generateUUID();
      
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('validateTaskText', () => {
    beforeEach(() => {
      taskManager = new TaskManager(container);
    });

    it('should accept valid task text', () => {
      expect(taskManager.validateTaskText('Valid task')).toBe(true);
      expect(taskManager.validateTaskText('A')).toBe(true);
    });

    it('should reject empty string', () => {
      expect(taskManager.validateTaskText('')).toBe(false);
    });

    it('should reject whitespace-only string', () => {
      expect(taskManager.validateTaskText('   ')).toBe(false);
      expect(taskManager.validateTaskText('\t\n')).toBe(false);
    });

    it('should reject text longer than 500 characters', () => {
      const longText = 'a'.repeat(501);
      expect(taskManager.validateTaskText(longText)).toBe(false);
    });

    it('should accept text exactly 500 characters', () => {
      const maxText = 'a'.repeat(500);
      expect(taskManager.validateTaskText(maxText)).toBe(true);
    });

    it('should reject non-string values', () => {
      expect(taskManager.validateTaskText(null)).toBe(false);
      expect(taskManager.validateTaskText(undefined)).toBe(false);
      expect(taskManager.validateTaskText(123)).toBe(false);
      expect(taskManager.validateTaskText({})).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(taskManager.validateTaskText('  Valid task  ')).toBe(true);
    });
  });

  describe('addTask', () => {
    beforeEach(() => {
      taskManager = new TaskManager(container);
      taskManager.init();
      vi.spyOn(taskManager, 'save');
      vi.spyOn(taskManager, 'render');
    });

    it('should add task with valid text', () => {
      const result = taskManager.addTask('New task');
      
      expect(result).toBe(true);
      expect(taskManager.tasks.length).toBe(1);
      expect(taskManager.tasks[0].text).toBe('New task');
    });

    it('should trim task text', () => {
      taskManager.addTask('  Trimmed task  ');
      
      expect(taskManager.tasks[0].text).toBe('Trimmed task');
    });

    it('should generate UUID for new task', () => {
      taskManager.addTask('Task with ID');
      
      expect(taskManager.tasks[0].id).toBeTruthy();
      expect(typeof taskManager.tasks[0].id).toBe('string');
    });

    it('should set completed to false for new task', () => {
      taskManager.addTask('Incomplete task');
      
      expect(taskManager.tasks[0].completed).toBe(false);
    });

    it('should set createdAt timestamp', () => {
      const beforeTime = Date.now();
      taskManager.addTask('Task with timestamp');
      const afterTime = Date.now();
      
      expect(taskManager.tasks[0].createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(taskManager.tasks[0].createdAt).toBeLessThanOrEqual(afterTime);
    });

    it('should set updatedAt timestamp equal to createdAt', () => {
      taskManager.addTask('New task');
      
      expect(taskManager.tasks[0].updatedAt).toBe(taskManager.tasks[0].createdAt);
    });

    it('should call save after adding task', () => {
      taskManager.addTask('Task to save');
      
      expect(taskManager.save).toHaveBeenCalled();
    });

    it('should call render after adding task', () => {
      taskManager.addTask('Task to render');
      
      expect(taskManager.render).toHaveBeenCalled();
    });

    it('should reject empty text', () => {
      const result = taskManager.addTask('');
      
      expect(result).toBe(false);
      expect(taskManager.tasks.length).toBe(0);
    });

    it('should reject whitespace-only text', () => {
      const result = taskManager.addTask('   ');
      
      expect(result).toBe(false);
      expect(taskManager.tasks.length).toBe(0);
    });

    it('should reject text longer than 500 characters', () => {
      const longText = 'a'.repeat(501);
      const result = taskManager.addTask(longText);
      
      expect(result).toBe(false);
      expect(taskManager.tasks.length).toBe(0);
    });

    it('should add multiple tasks', () => {
      taskManager.addTask('Task 1');
      taskManager.addTask('Task 2');
      taskManager.addTask('Task 3');
      
      expect(taskManager.tasks.length).toBe(3);
      expect(taskManager.tasks[0].text).toBe('Task 1');
      expect(taskManager.tasks[1].text).toBe('Task 2');
      expect(taskManager.tasks[2].text).toBe('Task 3');
    });
  });

  describe('editTask', () => {
    beforeEach(() => {
      taskManager = new TaskManager(container);
      taskManager.init();
      taskManager.addTask('Original task');
      vi.spyOn(taskManager, 'save');
      vi.spyOn(taskManager, 'render');
    });

    it('should update task text', () => {
      const taskId = taskManager.tasks[0].id;
      const result = taskManager.editTask(taskId, 'Updated task');
      
      expect(result).toBe(true);
      expect(taskManager.tasks[0].text).toBe('Updated task');
    });

    it('should trim new text', () => {
      const taskId = taskManager.tasks[0].id;
      taskManager.editTask(taskId, '  Trimmed update  ');
      
      expect(taskManager.tasks[0].text).toBe('Trimmed update');
    });

    it('should update updatedAt timestamp', () => {
      const taskId = taskManager.tasks[0].id;
      const originalUpdatedAt = taskManager.tasks[0].updatedAt;
      
      // Wait a bit to ensure timestamp changes
      vi.useFakeTimers();
      vi.advanceTimersByTime(100);
      
      taskManager.editTask(taskId, 'Updated task');
      
      expect(taskManager.tasks[0].updatedAt).toBeGreaterThan(originalUpdatedAt);
      
      vi.useRealTimers();
    });

    it('should not change createdAt timestamp', () => {
      const taskId = taskManager.tasks[0].id;
      const originalCreatedAt = taskManager.tasks[0].createdAt;
      
      taskManager.editTask(taskId, 'Updated task');
      
      expect(taskManager.tasks[0].createdAt).toBe(originalCreatedAt);
    });

    it('should call save after editing', () => {
      const taskId = taskManager.tasks[0].id;
      taskManager.editTask(taskId, 'Updated task');
      
      expect(taskManager.save).toHaveBeenCalled();
    });

    it('should call render after editing', () => {
      const taskId = taskManager.tasks[0].id;
      taskManager.editTask(taskId, 'Updated task');
      
      expect(taskManager.render).toHaveBeenCalled();
    });

    it('should reject empty text', () => {
      const taskId = taskManager.tasks[0].id;
      const result = taskManager.editTask(taskId, '');
      
      expect(result).toBe(false);
      expect(taskManager.tasks[0].text).toBe('Original task');
    });

    it('should reject whitespace-only text', () => {
      const taskId = taskManager.tasks[0].id;
      const result = taskManager.editTask(taskId, '   ');
      
      expect(result).toBe(false);
      expect(taskManager.tasks[0].text).toBe('Original task');
    });

    it('should reject text longer than 500 characters', () => {
      const taskId = taskManager.tasks[0].id;
      const longText = 'a'.repeat(501);
      const result = taskManager.editTask(taskId, longText);
      
      expect(result).toBe(false);
      expect(taskManager.tasks[0].text).toBe('Original task');
    });

    it('should return false for non-existent task ID', () => {
      const result = taskManager.editTask('non-existent-id', 'New text');
      
      expect(result).toBe(false);
    });
  });

  describe('toggleTask', () => {
    beforeEach(() => {
      taskManager = new TaskManager(container);
      taskManager.init();
      taskManager.addTask('Task to toggle');
      vi.spyOn(taskManager, 'save');
      vi.spyOn(taskManager, 'render');
    });

    it('should toggle completed from false to true', () => {
      const taskId = taskManager.tasks[0].id;
      const result = taskManager.toggleTask(taskId);
      
      expect(result).toBe(true);
      expect(taskManager.tasks[0].completed).toBe(true);
    });

    it('should toggle completed from true to false', () => {
      const taskId = taskManager.tasks[0].id;
      taskManager.tasks[0].completed = true;
      
      const result = taskManager.toggleTask(taskId);
      
      expect(result).toBe(true);
      expect(taskManager.tasks[0].completed).toBe(false);
    });

    it('should update updatedAt timestamp', () => {
      const taskId = taskManager.tasks[0].id;
      const originalUpdatedAt = taskManager.tasks[0].updatedAt;
      
      vi.useFakeTimers();
      vi.advanceTimersByTime(100);
      
      taskManager.toggleTask(taskId);
      
      expect(taskManager.tasks[0].updatedAt).toBeGreaterThan(originalUpdatedAt);
      
      vi.useRealTimers();
    });

    it('should call save after toggling', () => {
      const taskId = taskManager.tasks[0].id;
      taskManager.toggleTask(taskId);
      
      expect(taskManager.save).toHaveBeenCalled();
    });

    it('should call render after toggling', () => {
      const taskId = taskManager.tasks[0].id;
      taskManager.toggleTask(taskId);
      
      expect(taskManager.render).toHaveBeenCalled();
    });

    it('should return false for non-existent task ID', () => {
      const result = taskManager.toggleTask('non-existent-id');
      
      expect(result).toBe(false);
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      taskManager = new TaskManager(container);
      taskManager.init();
      taskManager.addTask('Task 1');
      taskManager.addTask('Task 2');
      taskManager.addTask('Task 3');
      vi.spyOn(taskManager, 'save');
      vi.spyOn(taskManager, 'render');
    });

    it('should remove task from list', () => {
      const taskId = taskManager.tasks[1].id;
      const result = taskManager.deleteTask(taskId);
      
      expect(result).toBe(true);
      expect(taskManager.tasks.length).toBe(2);
      expect(taskManager.tasks.find(t => t.id === taskId)).toBeUndefined();
    });

    it('should call save after deleting', () => {
      const taskId = taskManager.tasks[0].id;
      taskManager.deleteTask(taskId);
      
      expect(taskManager.save).toHaveBeenCalled();
    });

    it('should call render after deleting', () => {
      const taskId = taskManager.tasks[0].id;
      taskManager.deleteTask(taskId);
      
      expect(taskManager.render).toHaveBeenCalled();
    });

    it('should return false for non-existent task ID', () => {
      const result = taskManager.deleteTask('non-existent-id');
      
      expect(result).toBe(false);
    });

    it('should delete first task correctly', () => {
      const firstTaskId = taskManager.tasks[0].id;
      taskManager.deleteTask(firstTaskId);
      
      expect(taskManager.tasks.length).toBe(2);
      expect(taskManager.tasks[0].text).toBe('Task 2');
    });

    it('should delete last task correctly', () => {
      const lastTaskId = taskManager.tasks[2].id;
      taskManager.deleteTask(lastTaskId);
      
      expect(taskManager.tasks.length).toBe(2);
      expect(taskManager.tasks[1].text).toBe('Task 2');
    });
  });

  describe('render', () => {
    beforeEach(() => {
      taskManager = new TaskManager(container);
      taskManager.init();
    });

    it('should render all tasks in the list', () => {
      taskManager.addTask('Task 1');
      taskManager.addTask('Task 2');
      taskManager.addTask('Task 3');
      
      const taskItems = container.querySelectorAll('.task-item');
      expect(taskItems.length).toBe(3);
    });

    it('should render task text correctly', () => {
      taskManager.addTask('My test task');
      
      const taskText = container.querySelector('.task-text');
      expect(taskText.textContent).toBe('My test task');
    });

    it('should render checkbox unchecked for incomplete task', () => {
      taskManager.addTask('Incomplete task');
      
      const checkbox = container.querySelector('.task-checkbox');
      expect(checkbox.checked).toBe(false);
    });

    it('should render checkbox checked for completed task', () => {
      taskManager.addTask('Completed task');
      taskManager.tasks[0].completed = true;
      taskManager.render();
      
      const checkbox = container.querySelector('.task-checkbox');
      expect(checkbox.checked).toBe(true);
    });

    it('should add completed class to completed tasks', () => {
      taskManager.addTask('Completed task');
      taskManager.tasks[0].completed = true;
      taskManager.render();
      
      const taskItem = container.querySelector('.task-item');
      expect(taskItem.classList.contains('completed')).toBe(true);
    });

    it('should set data-task-id attribute', () => {
      taskManager.addTask('Task with ID');
      const taskId = taskManager.tasks[0].id;
      
      const taskItem = container.querySelector('.task-item');
      expect(taskItem.dataset.taskId).toBe(taskId);
    });

    it('should render edit and delete buttons', () => {
      taskManager.addTask('Task with buttons');
      
      expect(container.querySelector('.btn-edit-task')).toBeTruthy();
      expect(container.querySelector('.btn-delete-task')).toBeTruthy();
    });

    it('should escape HTML in task text', () => {
      taskManager.addTask('<script>alert("xss")</script>');
      
      const taskText = container.querySelector('.task-text');
      expect(taskText.innerHTML).toContain('&lt;script&gt;');
      expect(taskText.innerHTML).not.toContain('<script>');
    });
  });

  describe('save', () => {
    beforeEach(() => {
      taskManager = new TaskManager(container);
      taskManager.init();
    });

    it('should save tasks to storage', () => {
      taskManager.addTask('Task 1');
      taskManager.addTask('Task 2');
      
      // save is called by addTask, so we need to check the last call
      expect(StorageManager.set).toHaveBeenCalledWith('dashboard_tasks', taskManager.tasks);
    });
  });

  describe('button interactions', () => {
    beforeEach(() => {
      taskManager = new TaskManager(container);
      taskManager.init();
    });

    it('should add task when add button clicked', () => {
      const input = container.querySelector('.task-input');
      const addBtn = container.querySelector('.btn-add-task');
      
      input.value = 'New task from button';
      addBtn.click();
      
      expect(taskManager.tasks.length).toBe(1);
      expect(taskManager.tasks[0].text).toBe('New task from button');
    });

    it('should clear input after adding task', () => {
      const input = container.querySelector('.task-input');
      const addBtn = container.querySelector('.btn-add-task');
      
      input.value = 'Task to clear';
      addBtn.click();
      
      expect(input.value).toBe('');
    });

    it('should add task when Enter key pressed', () => {
      const input = container.querySelector('.task-input');
      
      input.value = 'Task from Enter';
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      input.dispatchEvent(event);
      
      expect(taskManager.tasks.length).toBe(1);
      expect(taskManager.tasks[0].text).toBe('Task from Enter');
    });

    it('should toggle task when checkbox clicked', () => {
      taskManager.addTask('Task to toggle');
      
      const checkbox = container.querySelector('.task-checkbox');
      checkbox.click();
      
      expect(taskManager.tasks[0].completed).toBe(true);
    });

    it('should delete task when delete button clicked', () => {
      taskManager.addTask('Task to delete');
      
      const deleteBtn = container.querySelector('.btn-delete-task');
      deleteBtn.click();
      
      expect(taskManager.tasks.length).toBe(0);
    });
  });

  describe('escapeHtml', () => {
    beforeEach(() => {
      taskManager = new TaskManager(container);
    });

    it('should escape HTML special characters', () => {
      expect(taskManager.escapeHtml('<div>')).toBe('&lt;div&gt;');
      expect(taskManager.escapeHtml('&')).toBe('&amp;');
      expect(taskManager.escapeHtml('"')).toBe('&quot;');
    });

    it('should not modify plain text', () => {
      expect(taskManager.escapeHtml('Plain text')).toBe('Plain text');
    });
  });
});
