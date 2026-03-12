import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import QuickLinks from '../../components/quickLinks.js';
import StorageManager from '../../utils/storage.js';

describe('QuickLinks', () => {
  let container;
  let quickLinks;

  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Mock StorageManager
    vi.spyOn(StorageManager, 'get').mockReturnValue([]);
    vi.spyOn(StorageManager, 'set').mockReturnValue(true);
    
    // Mock window.open
    vi.spyOn(window, 'open').mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  describe('init', () => {
    it('should create DOM structure with input section and links grid', () => {
      quickLinks = new QuickLinks(container);
      quickLinks.init();

      expect(container.querySelector('.links-container')).toBeTruthy();
      expect(container.querySelector('.link-input-section')).toBeTruthy();
      expect(container.querySelector('.link-name-input')).toBeTruthy();
      expect(container.querySelector('.link-url-input')).toBeTruthy();
      expect(container.querySelector('.btn-add-link')).toBeTruthy();
      expect(container.querySelector('.links-grid')).toBeTruthy();
    });

    it('should initialize with empty links list', () => {
      quickLinks = new QuickLinks(container);
      quickLinks.init();

      expect(quickLinks.links).toEqual([]);
    });

    it('should load links from storage', () => {
      const savedLinks = [
        { id: '1', name: 'Google', url: 'https://google.com', createdAt: 1000, updatedAt: 1000 },
        { id: '2', name: 'GitHub', url: 'https://github.com', createdAt: 2000, updatedAt: 2000 }
      ];
      StorageManager.get.mockReturnValue(savedLinks);
      
      quickLinks = new QuickLinks(container);
      quickLinks.init();

      expect(StorageManager.get).toHaveBeenCalledWith('dashboard_links', []);
      expect(quickLinks.links).toEqual(savedLinks);
    });

    it('should handle corrupted storage data gracefully', () => {
      StorageManager.get.mockReturnValue(null);
      
      quickLinks = new QuickLinks(container);
      quickLinks.init();

      expect(quickLinks.links).toEqual([]);
    });
  });

  describe('generateUUID', () => {
    beforeEach(() => {
      quickLinks = new QuickLinks(container);
    });

    it('should generate a valid UUID v4 format', () => {
      const uuid = quickLinks.generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = quickLinks.generateUUID();
      const uuid2 = quickLinks.generateUUID();
      
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('validateUrl', () => {
    beforeEach(() => {
      quickLinks = new QuickLinks(container);
    });

    it('should accept URLs starting with http://', () => {
      expect(quickLinks.validateUrl('http://example.com')).toBe(true);
    });

    it('should accept URLs starting with https://', () => {
      expect(quickLinks.validateUrl('https://example.com')).toBe(true);
    });

    it('should reject URLs without protocol', () => {
      expect(quickLinks.validateUrl('example.com')).toBe(false);
      expect(quickLinks.validateUrl('www.example.com')).toBe(false);
    });

    it('should reject URLs with other protocols', () => {
      expect(quickLinks.validateUrl('ftp://example.com')).toBe(false);
      expect(quickLinks.validateUrl('file:///path/to/file')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(quickLinks.validateUrl('')).toBe(false);
    });

    it('should reject whitespace-only string', () => {
      expect(quickLinks.validateUrl('   ')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(quickLinks.validateUrl(null)).toBe(false);
      expect(quickLinks.validateUrl(undefined)).toBe(false);
      expect(quickLinks.validateUrl(123)).toBe(false);
      expect(quickLinks.validateUrl({})).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(quickLinks.validateUrl('  https://example.com  ')).toBe(true);
    });
  });

  describe('validateLinkName', () => {
    beforeEach(() => {
      quickLinks = new QuickLinks(container);
    });

    it('should accept valid link names', () => {
      expect(quickLinks.validateLinkName('Google')).toBe(true);
      expect(quickLinks.validateLinkName('A')).toBe(true);
    });

    it('should reject empty string', () => {
      expect(quickLinks.validateLinkName('')).toBe(false);
    });

    it('should reject whitespace-only string', () => {
      expect(quickLinks.validateLinkName('   ')).toBe(false);
      expect(quickLinks.validateLinkName('\t\n')).toBe(false);
    });

    it('should reject names longer than 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(quickLinks.validateLinkName(longName)).toBe(false);
    });

    it('should accept names exactly 50 characters', () => {
      const maxName = 'a'.repeat(50);
      expect(quickLinks.validateLinkName(maxName)).toBe(true);
    });

    it('should reject non-string values', () => {
      expect(quickLinks.validateLinkName(null)).toBe(false);
      expect(quickLinks.validateLinkName(undefined)).toBe(false);
      expect(quickLinks.validateLinkName(123)).toBe(false);
      expect(quickLinks.validateLinkName({})).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(quickLinks.validateLinkName('  Valid name  ')).toBe(true);
    });
  });

  describe('addLink', () => {
    beforeEach(() => {
      quickLinks = new QuickLinks(container);
      quickLinks.init();
      vi.spyOn(quickLinks, 'save');
      vi.spyOn(quickLinks, 'render');
    });

    it('should add link with valid name and URL', () => {
      const result = quickLinks.addLink('Google', 'https://google.com');
      
      expect(result).toBe(true);
      expect(quickLinks.links.length).toBe(1);
      expect(quickLinks.links[0].name).toBe('Google');
      expect(quickLinks.links[0].url).toBe('https://google.com');
    });

    it('should trim link name and URL', () => {
      quickLinks.addLink('  GitHub  ', '  https://github.com  ');
      
      expect(quickLinks.links[0].name).toBe('GitHub');
      expect(quickLinks.links[0].url).toBe('https://github.com');
    });

    it('should generate UUID for new link', () => {
      quickLinks.addLink('Link', 'https://example.com');
      
      expect(quickLinks.links[0].id).toBeTruthy();
      expect(typeof quickLinks.links[0].id).toBe('string');
    });

    it('should set createdAt timestamp', () => {
      const beforeTime = Date.now();
      quickLinks.addLink('Link', 'https://example.com');
      const afterTime = Date.now();
      
      expect(quickLinks.links[0].createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(quickLinks.links[0].createdAt).toBeLessThanOrEqual(afterTime);
    });

    it('should set updatedAt timestamp equal to createdAt', () => {
      quickLinks.addLink('Link', 'https://example.com');
      
      expect(quickLinks.links[0].updatedAt).toBe(quickLinks.links[0].createdAt);
    });

    it('should call save after adding link', () => {
      quickLinks.addLink('Link', 'https://example.com');
      
      expect(quickLinks.save).toHaveBeenCalled();
    });

    it('should call render after adding link', () => {
      quickLinks.addLink('Link', 'https://example.com');
      
      expect(quickLinks.render).toHaveBeenCalled();
    });

    it('should reject empty name', () => {
      const result = quickLinks.addLink('', 'https://example.com');
      
      expect(result).toBe(false);
      expect(quickLinks.links.length).toBe(0);
    });

    it('should reject whitespace-only name', () => {
      const result = quickLinks.addLink('   ', 'https://example.com');
      
      expect(result).toBe(false);
      expect(quickLinks.links.length).toBe(0);
    });

    it('should reject name longer than 50 characters', () => {
      const longName = 'a'.repeat(51);
      const result = quickLinks.addLink(longName, 'https://example.com');
      
      expect(result).toBe(false);
      expect(quickLinks.links.length).toBe(0);
    });

    it('should reject invalid URL', () => {
      const result = quickLinks.addLink('Link', 'example.com');
      
      expect(result).toBe(false);
      expect(quickLinks.links.length).toBe(0);
    });

    it('should add multiple links', () => {
      quickLinks.addLink('Google', 'https://google.com');
      quickLinks.addLink('GitHub', 'https://github.com');
      quickLinks.addLink('Stack Overflow', 'https://stackoverflow.com');
      
      expect(quickLinks.links.length).toBe(3);
      expect(quickLinks.links[0].name).toBe('Google');
      expect(quickLinks.links[1].name).toBe('GitHub');
      expect(quickLinks.links[2].name).toBe('Stack Overflow');
    });
  });

  describe('editLink', () => {
    beforeEach(() => {
      quickLinks = new QuickLinks(container);
      quickLinks.init();
      quickLinks.addLink('Original', 'https://original.com');
      vi.spyOn(quickLinks, 'save');
      vi.spyOn(quickLinks, 'render');
    });

    it('should update link name and URL', () => {
      const linkId = quickLinks.links[0].id;
      const result = quickLinks.editLink(linkId, 'Updated', 'https://updated.com');
      
      expect(result).toBe(true);
      expect(quickLinks.links[0].name).toBe('Updated');
      expect(quickLinks.links[0].url).toBe('https://updated.com');
    });

    it('should trim new name and URL', () => {
      const linkId = quickLinks.links[0].id;
      quickLinks.editLink(linkId, '  Trimmed  ', '  https://trimmed.com  ');
      
      expect(quickLinks.links[0].name).toBe('Trimmed');
      expect(quickLinks.links[0].url).toBe('https://trimmed.com');
    });

    it('should update updatedAt timestamp', () => {
      const linkId = quickLinks.links[0].id;
      const originalUpdatedAt = quickLinks.links[0].updatedAt;
      
      vi.useFakeTimers();
      vi.advanceTimersByTime(100);
      
      quickLinks.editLink(linkId, 'Updated', 'https://updated.com');
      
      expect(quickLinks.links[0].updatedAt).toBeGreaterThan(originalUpdatedAt);
      
      vi.useRealTimers();
    });

    it('should not change createdAt timestamp', () => {
      const linkId = quickLinks.links[0].id;
      const originalCreatedAt = quickLinks.links[0].createdAt;
      
      quickLinks.editLink(linkId, 'Updated', 'https://updated.com');
      
      expect(quickLinks.links[0].createdAt).toBe(originalCreatedAt);
    });

    it('should call save after editing', () => {
      const linkId = quickLinks.links[0].id;
      quickLinks.editLink(linkId, 'Updated', 'https://updated.com');
      
      expect(quickLinks.save).toHaveBeenCalled();
    });

    it('should call render after editing', () => {
      const linkId = quickLinks.links[0].id;
      quickLinks.editLink(linkId, 'Updated', 'https://updated.com');
      
      expect(quickLinks.render).toHaveBeenCalled();
    });

    it('should reject empty name', () => {
      const linkId = quickLinks.links[0].id;
      const result = quickLinks.editLink(linkId, '', 'https://updated.com');
      
      expect(result).toBe(false);
      expect(quickLinks.links[0].name).toBe('Original');
    });

    it('should reject invalid URL', () => {
      const linkId = quickLinks.links[0].id;
      const result = quickLinks.editLink(linkId, 'Updated', 'invalid-url');
      
      expect(result).toBe(false);
      expect(quickLinks.links[0].url).toBe('https://original.com');
    });

    it('should return false for non-existent link ID', () => {
      const result = quickLinks.editLink('non-existent-id', 'Name', 'https://example.com');
      
      expect(result).toBe(false);
    });
  });

  describe('deleteLink', () => {
    beforeEach(() => {
      quickLinks = new QuickLinks(container);
      quickLinks.init();
      quickLinks.addLink('Link 1', 'https://link1.com');
      quickLinks.addLink('Link 2', 'https://link2.com');
      quickLinks.addLink('Link 3', 'https://link3.com');
      vi.spyOn(quickLinks, 'save');
      vi.spyOn(quickLinks, 'render');
    });

    it('should remove link from list', () => {
      const linkId = quickLinks.links[1].id;
      const result = quickLinks.deleteLink(linkId);
      
      expect(result).toBe(true);
      expect(quickLinks.links.length).toBe(2);
      expect(quickLinks.links.find(l => l.id === linkId)).toBeUndefined();
    });

    it('should call save after deleting', () => {
      const linkId = quickLinks.links[0].id;
      quickLinks.deleteLink(linkId);
      
      expect(quickLinks.save).toHaveBeenCalled();
    });

    it('should call render after deleting', () => {
      const linkId = quickLinks.links[0].id;
      quickLinks.deleteLink(linkId);
      
      expect(quickLinks.render).toHaveBeenCalled();
    });

    it('should return false for non-existent link ID', () => {
      const result = quickLinks.deleteLink('non-existent-id');
      
      expect(result).toBe(false);
    });
  });

  describe('openLink', () => {
    beforeEach(() => {
      quickLinks = new QuickLinks(container);
    });

    it('should open valid URL in new tab', () => {
      quickLinks.openLink('https://example.com');
      
      expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    });

    it('should not open invalid URL', () => {
      quickLinks.openLink('invalid-url');
      
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('render', () => {
    beforeEach(() => {
      quickLinks = new QuickLinks(container);
      quickLinks.init();
    });

    it('should render all links in the grid', () => {
      quickLinks.addLink('Link 1', 'https://link1.com');
      quickLinks.addLink('Link 2', 'https://link2.com');
      quickLinks.addLink('Link 3', 'https://link3.com');
      
      const linkItems = container.querySelectorAll('.link-item');
      expect(linkItems.length).toBe(3);
    });

    it('should render link name correctly', () => {
      quickLinks.addLink('My Link', 'https://example.com');
      
      const linkButton = container.querySelector('.link-button');
      expect(linkButton.textContent).toBe('My Link');
    });

    it('should set data-link-id attribute', () => {
      quickLinks.addLink('Link', 'https://example.com');
      const linkId = quickLinks.links[0].id;
      
      const linkItem = container.querySelector('.link-item');
      expect(linkItem.dataset.linkId).toBe(linkId);
    });

    it('should render edit and delete buttons', () => {
      quickLinks.addLink('Link', 'https://example.com');
      
      expect(container.querySelector('.btn-edit-link')).toBeTruthy();
      expect(container.querySelector('.btn-delete-link')).toBeTruthy();
    });

    it('should escape HTML in link name', () => {
      quickLinks.addLink('<script>alert("xss")</script>', 'https://example.com');
      
      const linkButton = container.querySelector('.link-button');
      expect(linkButton.innerHTML).toContain('&lt;script&gt;');
      expect(linkButton.innerHTML).not.toContain('<script>');
    });
  });

  describe('save', () => {
    beforeEach(() => {
      quickLinks = new QuickLinks(container);
      quickLinks.init();
    });

    it('should save links to storage', () => {
      quickLinks.addLink('Link 1', 'https://link1.com');
      quickLinks.addLink('Link 2', 'https://link2.com');
      
      expect(StorageManager.set).toHaveBeenCalledWith('dashboard_links', quickLinks.links);
    });
  });

  describe('button interactions', () => {
    beforeEach(() => {
      quickLinks = new QuickLinks(container);
      quickLinks.init();
    });

    it('should add link when add button clicked', () => {
      const nameInput = container.querySelector('.link-name-input');
      const urlInput = container.querySelector('.link-url-input');
      const addBtn = container.querySelector('.btn-add-link');
      
      nameInput.value = 'New Link';
      urlInput.value = 'https://newlink.com';
      addBtn.click();
      
      expect(quickLinks.links.length).toBe(1);
      expect(quickLinks.links[0].name).toBe('New Link');
      expect(quickLinks.links[0].url).toBe('https://newlink.com');
    });

    it('should clear inputs after adding link', () => {
      const nameInput = container.querySelector('.link-name-input');
      const urlInput = container.querySelector('.link-url-input');
      const addBtn = container.querySelector('.btn-add-link');
      
      nameInput.value = 'Link';
      urlInput.value = 'https://example.com';
      addBtn.click();
      
      expect(nameInput.value).toBe('');
      expect(urlInput.value).toBe('');
    });

    it('should add link when Enter key pressed in name input', () => {
      const nameInput = container.querySelector('.link-name-input');
      const urlInput = container.querySelector('.link-url-input');
      
      nameInput.value = 'Link from Enter';
      urlInput.value = 'https://example.com';
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      nameInput.dispatchEvent(event);
      
      expect(quickLinks.links.length).toBe(1);
      expect(quickLinks.links[0].name).toBe('Link from Enter');
    });

    it('should add link when Enter key pressed in URL input', () => {
      const nameInput = container.querySelector('.link-name-input');
      const urlInput = container.querySelector('.link-url-input');
      
      nameInput.value = 'Link from Enter';
      urlInput.value = 'https://example.com';
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      urlInput.dispatchEvent(event);
      
      expect(quickLinks.links.length).toBe(1);
      expect(quickLinks.links[0].name).toBe('Link from Enter');
    });

    it('should open link when link button clicked', () => {
      quickLinks.addLink('Link', 'https://example.com');
      
      const linkButton = container.querySelector('.link-button');
      linkButton.click();
      
      expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    });

    it('should delete link when delete button clicked', () => {
      quickLinks.addLink('Link to delete', 'https://example.com');
      
      const deleteBtn = container.querySelector('.btn-delete-link');
      deleteBtn.click();
      
      expect(quickLinks.links.length).toBe(0);
    });
  });

  describe('escapeHtml', () => {
    beforeEach(() => {
      quickLinks = new QuickLinks(container);
    });

    it('should escape HTML special characters', () => {
      expect(quickLinks.escapeHtml('<div>')).toBe('&lt;div&gt;');
      expect(quickLinks.escapeHtml('&')).toBe('&amp;');
      expect(quickLinks.escapeHtml('"')).toBe('&quot;');
    });

    it('should not modify plain text', () => {
      expect(quickLinks.escapeHtml('Plain text')).toBe('Plain text');
    });
  });
});
