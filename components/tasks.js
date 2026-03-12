/**
 * TaskManager - Manages a list of tasks with add, edit, complete, and delete operations
 */
import StorageManager from '../utils/storage.js';

class TaskManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.tasks = [];
  }

  /**
   * Initialize and render tasks from storage
   */
  init() {
    // Load tasks from storage
    const savedTasks = StorageManager.get('dashboard_tasks', []);
    this.tasks = Array.isArray(savedTasks) ? savedTasks : [];

    this.render();
  }

  /**
   * Generate a UUID v4
   * @returns {string} UUID string
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validate task text
   * @param {string} text - Task text to validate
   * @returns {boolean} True if valid
   */
  validateTaskText(text) {
    if (typeof text !== 'string') {
      return false;
    }

    const trimmed = text.trim();
    return trimmed.length > 0 && trimmed.length <= 500;
  }

  /**
   * Add new task
   * @param {string} text - Task description
   * @returns {boolean} True if task was added successfully
   */
  addTask(text) {
    if (!this.validateTaskText(text)) {
      console.warn('Invalid task text');
      return false;
    }

    const task = {
      id: this.generateUUID(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.tasks.push(task);
    this.save();
    
    // Add only the new task item to DOM
    const taskList = this.container.querySelector('.task-list');
    if (taskList) {
      taskList.insertAdjacentHTML('beforeend', this.renderTaskItem(task));
    }
    
    return true;
  }

  /**
   * Update task text
   * @param {string} taskId - Task ID
   * @param {string} newText - New task text
   * @returns {boolean} True if task was updated successfully
   */
  editTask(taskId, newText) {
    if (!this.validateTaskText(newText)) {
      console.warn('Invalid task text');
      return false;
    }

    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      console.warn('Task not found');
      return false;
    }

    task.text = newText.trim();
    task.updatedAt = Date.now();
    this.save();
    
    // Update only the specific task item in DOM
    const taskItem = this.container.querySelector(`[data-task-id="${taskId}"]`);
    if (taskItem) {
      taskItem.outerHTML = this.renderTaskItem(task);
    }
    
    return true;
  }

  /**
   * Toggle task completion status
   * @param {string} taskId - Task ID
   * @returns {boolean} True if task was toggled successfully
   */
  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      console.warn('Task not found');
      return false;
    }

    task.completed = !task.completed;
    task.updatedAt = Date.now();
    this.save();
    
    // Update only the specific task item in DOM
    const taskItem = this.container.querySelector(`[data-task-id="${taskId}"]`);
    if (taskItem) {
      taskItem.outerHTML = this.renderTaskItem(task);
    }
    
    return true;
  }

  /**
   * Delete task
   * @param {string} taskId - Task ID
   * @returns {boolean} True if task was deleted successfully
   */
  deleteTask(taskId) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index === -1) {
      console.warn('Task not found');
      return false;
    }

    this.tasks.splice(index, 1);
    this.save();
    
    // Remove only the specific task item from DOM
    const taskItem = this.container.querySelector(`[data-task-id="${taskId}"]`);
    if (taskItem) {
      taskItem.remove();
    }
    
    return true;
  }

  /**
   * Render all tasks to DOM
   */
  render() {
    // Only create structure if it doesn't exist
    if (!this.container.querySelector('.tasks-container')) {
      this.container.innerHTML = `
        <div class="tasks-container">
          <div class="task-input-section">
            <input type="text" class="task-input" placeholder="Add a new task..." maxlength="500" />
            <button class="btn-add-task">Add</button>
          </div>
          <ul class="task-list">
          </ul>
        </div>
      `;
      this.attachEventListeners();
    }

    // Update only the task list
    const taskList = this.container.querySelector('.task-list');
    if (taskList) {
      taskList.innerHTML = this.tasks.map(task => this.renderTaskItem(task)).join('');
    }
  }

  /**
   * Render a single task item
   * @param {Object} task - Task object
   * @returns {string} HTML string for task item
   */
  renderTaskItem(task) {
    return `
      <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} />
        <span class="task-text">${this.escapeHtml(task.text)}</span>
        <button class="btn-edit-task">Edit</button>
        <button class="btn-delete-task">Delete</button>
      </li>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Add task button
    const addBtn = this.container.querySelector('.btn-add-task');
    const taskInput = this.container.querySelector('.task-input');

    if (addBtn && taskInput) {
      addBtn.addEventListener('click', () => {
        const text = taskInput.value;
        if (this.addTask(text)) {
          taskInput.value = '';
        }
      });

      // Allow Enter key to add task
      taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const text = taskInput.value;
          if (this.addTask(text)) {
            taskInput.value = '';
          }
        }
      });
    }

    // Task list event delegation
    const taskList = this.container.querySelector('.task-list');
    if (taskList) {
      taskList.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        const taskId = taskItem.dataset.taskId;

        // Handle checkbox toggle
        if (e.target.classList.contains('task-checkbox')) {
          this.toggleTask(taskId);
        }

        // Handle edit button
        if (e.target.classList.contains('btn-edit-task')) {
          this.handleEditTask(taskId, taskItem);
        }

        // Handle delete button
        if (e.target.classList.contains('btn-delete-task')) {
          this.deleteTask(taskId);
        }
      });
    }
  }

  /**
   * Handle task editing with inline input
   * @param {string} taskId - Task ID
   * @param {HTMLElement} taskItem - Task item element
   */
  handleEditTask(taskId, taskItem) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskTextSpan = taskItem.querySelector('.task-text');
    const currentText = task.text;

    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit-input';
    input.value = currentText;
    input.maxLength = 500;

    // Replace span with input
    taskTextSpan.replaceWith(input);
    input.focus();
    input.select();

    // Save on blur or Enter
    const saveEdit = () => {
      const newText = input.value;
      if (this.validateTaskText(newText)) {
        // Update data
        task.text = newText.trim();
        task.updatedAt = Date.now();
        this.save();
        
        // Update only this task item
        taskItem.outerHTML = this.renderTaskItem(task);
      } else {
        // Revert if invalid
        taskItem.outerHTML = this.renderTaskItem(task);
      }
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveEdit();
      }
    });
  }

  /**
   * Save tasks to storage
   */
  save() {
    StorageManager.set('dashboard_tasks', this.tasks);
  }
}

export default TaskManager;
