/**
 * QuickLinks - Manages a collection of website shortcuts with add, edit, and delete operations
 */
import StorageManager from '../utils/storage.js';

class QuickLinks {
  constructor(containerElement) {
    this.container = containerElement;
    this.links = [];
  }

  /**
   * Initialize and render links from storage
   */
  init() {
    // Load links from storage
    const savedLinks = StorageManager.get('dashboard_links', []);
    this.links = Array.isArray(savedLinks) ? savedLinks : [];

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
   * Validate URL format (must start with http:// or https://)
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid
   */
  validateUrl(url) {
    if (typeof url !== 'string') {
      return false;
    }

    const trimmed = url.trim();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
  }

  /**
   * Validate link name (non-empty after trim, max 50 chars)
   * @param {string} name - Link name to validate
   * @returns {boolean} True if valid
   */
  validateLinkName(name) {
    if (typeof name !== 'string') {
      return false;
    }

    const trimmed = name.trim();
    return trimmed.length > 0 && trimmed.length <= 50;
  }

  /**
   * Add new link
   * @param {string} name - Link display name
   * @param {string} url - Link URL
   * @returns {boolean} True if link was added successfully
   */
  addLink(name, url) {
    if (!this.validateLinkName(name)) {
      console.warn('Invalid link name');
      return false;
    }

    if (!this.validateUrl(url)) {
      console.warn('Invalid URL - must start with http:// or https://');
      return false;
    }

    const link = {
      id: this.generateUUID(),
      name: name.trim(),
      url: url.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.links.push(link);
    this.save();
    
    // Add only the new link item to DOM
    const linksGrid = this.container.querySelector('.links-grid');
    if (linksGrid) {
      linksGrid.insertAdjacentHTML('beforeend', this.renderLinkItem(link));
    }
    
    return true;
  }

  /**
   * Update link
   * @param {string} linkId - Link ID
   * @param {string} name - New link name
   * @param {string} url - New link URL
   * @returns {boolean} True if link was updated successfully
   */
  editLink(linkId, name, url) {
    if (!this.validateLinkName(name)) {
      console.warn('Invalid link name');
      return false;
    }

    if (!this.validateUrl(url)) {
      console.warn('Invalid URL - must start with http:// or https://');
      return false;
    }

    const link = this.links.find(l => l.id === linkId);
    if (!link) {
      console.warn('Link not found');
      return false;
    }

    link.name = name.trim();
    link.url = url.trim();
    link.updatedAt = Date.now();
    this.save();
    
    // Update only the specific link item in DOM
    const linkItem = this.container.querySelector(`[data-link-id="${linkId}"]`);
    if (linkItem) {
      linkItem.outerHTML = this.renderLinkItem(link);
    }
    
    return true;
  }

  /**
   * Delete link
   * @param {string} linkId - Link ID
   * @returns {boolean} True if link was deleted successfully
   */
  deleteLink(linkId) {
    const index = this.links.findIndex(l => l.id === linkId);
    if (index === -1) {
      console.warn('Link not found');
      return false;
    }

    this.links.splice(index, 1);
    this.save();
    
    // Remove only the specific link item from DOM
    const linkItem = this.container.querySelector(`[data-link-id="${linkId}"]`);
    if (linkItem) {
      linkItem.remove();
    }
    
    return true;
  }

  /**
   * Open link in new tab
   * @param {string} url - URL to open
   */
  openLink(url) {
    if (this.validateUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Render all links to DOM
   */
  render() {
    // Only create structure if it doesn't exist
    if (!this.container.querySelector('.links-container')) {
      this.container.innerHTML = `
        <div class="links-container">
          <div class="link-input-section">
            <input type="text" class="link-name-input" placeholder="Name" maxlength="50" />
            <input type="url" class="link-url-input" placeholder="https://..." />
            <button class="btn-add-link">Add Link</button>
          </div>
          <div class="links-grid">
          </div>
        </div>
      `;
      this.attachEventListeners();
    }

    // Update only the links grid
    const linksGrid = this.container.querySelector('.links-grid');
    if (linksGrid) {
      linksGrid.innerHTML = this.links.map(link => this.renderLinkItem(link)).join('');
    }
  }

  /**
   * Render a single link item
   * @param {Object} link - Link object
   * @returns {string} HTML string for link item
   */
  renderLinkItem(link) {
    return `
      <div class="link-item" data-link-id="${link.id}">
        <button class="link-button">${this.escapeHtml(link.name)}</button>
        <div class="link-actions">
          <button class="btn-edit-link">Edit</button>
          <button class="btn-delete-link">Delete</button>
        </div>
      </div>
    `;
  }

  /**
   * Render link item inner content (for inline editing)
   * @param {Object} link - Link object
   * @returns {string} HTML string for link item inner content
   */
  renderLinkItemInner(link) {
    return `
      <button class="link-button">${this.escapeHtml(link.name)}</button>
      <div class="link-actions">
        <button class="btn-edit-link">Edit</button>
        <button class="btn-delete-link">Delete</button>
      </div>
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
    // Add link button
    const addBtn = this.container.querySelector('.btn-add-link');
    const nameInput = this.container.querySelector('.link-name-input');
    const urlInput = this.container.querySelector('.link-url-input');

    if (addBtn && nameInput && urlInput) {
      addBtn.addEventListener('click', () => {
        const name = nameInput.value;
        const url = urlInput.value;
        if (this.addLink(name, url)) {
          nameInput.value = '';
          urlInput.value = '';
        }
      });

      // Allow Enter key to add link
      const handleEnter = (e) => {
        if (e.key === 'Enter') {
          const name = nameInput.value;
          const url = urlInput.value;
          if (this.addLink(name, url)) {
            nameInput.value = '';
            urlInput.value = '';
          }
        }
      };

      nameInput.addEventListener('keypress', handleEnter);
      urlInput.addEventListener('keypress', handleEnter);
    }

    // Links grid event delegation
    const linksGrid = this.container.querySelector('.links-grid');
    if (linksGrid) {
      linksGrid.addEventListener('click', (e) => {
        const linkItem = e.target.closest('.link-item');
        if (!linkItem) return;

        const linkId = linkItem.dataset.linkId;
        const link = this.links.find(l => l.id === linkId);
        if (!link) return;

        // Handle link button click (open link)
        if (e.target.classList.contains('link-button')) {
          this.openLink(link.url);
        }

        // Handle edit button
        if (e.target.classList.contains('btn-edit-link')) {
          this.handleEditLink(linkId, linkItem);
        }

        // Handle delete button
        if (e.target.classList.contains('btn-delete-link')) {
          this.deleteLink(linkId);
        }
      });
    }
  }

  /**
   * Handle link editing with inline inputs
   * @param {string} linkId - Link ID
   * @param {HTMLElement} linkItem - Link item element
   */
  handleEditLink(linkId, linkItem) {
    const link = this.links.find(l => l.id === linkId);
    if (!link) return;

    // Store original content
    const originalContent = linkItem.innerHTML;

    // Create edit form
    const editForm = document.createElement('div');
    editForm.className = 'link-edit-form';
    editForm.innerHTML = `
      <input type="text" class="link-edit-name-input" value="${this.escapeHtml(link.name)}" maxlength="50" />
      <input type="url" class="link-edit-url-input" value="${this.escapeHtml(link.url)}" />
      <button class="btn-save-link">Save</button>
      <button class="btn-cancel-link">Cancel</button>
    `;

    // Replace link item content with edit form
    linkItem.innerHTML = '';
    linkItem.appendChild(editForm);

    const nameInput = editForm.querySelector('.link-edit-name-input');
    const urlInput = editForm.querySelector('.link-edit-url-input');
    const saveBtn = editForm.querySelector('.btn-save-link');
    const cancelBtn = editForm.querySelector('.btn-cancel-link');

    nameInput.focus();
    nameInput.select();

    // Save edit
    const saveEdit = () => {
      const newName = nameInput.value;
      const newUrl = urlInput.value;
      if (this.validateLinkName(newName) && this.validateUrl(newUrl)) {
        // Update data
        link.name = newName.trim();
        link.url = newUrl.trim();
        link.updatedAt = Date.now();
        this.save();
        
        // Update only this link item inner content
        linkItem.innerHTML = this.renderLinkItemInner(link);
      } else {
        // Show error and restore original
        alert('Invalid name or URL. Name must be 1-50 characters, URL must start with http:// or https://');
        linkItem.innerHTML = originalContent;
      }
    };

    // Cancel edit
    const cancelEdit = () => {
      linkItem.innerHTML = originalContent;
    };

    saveBtn.addEventListener('click', saveEdit);
    cancelBtn.addEventListener('click', cancelEdit);

    // Save on Enter in either input
    const handleEnter = (e) => {
      if (e.key === 'Enter') {
        saveEdit();
      }
    };

    nameInput.addEventListener('keypress', handleEnter);
    urlInput.addEventListener('keypress', handleEnter);
  }

  /**
   * Save links to storage
   */
  save() {
    StorageManager.set('dashboard_links', this.links);
  }
}

export default QuickLinks;
