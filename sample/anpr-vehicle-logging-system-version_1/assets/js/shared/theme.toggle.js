/**
 * Theme Toggle
 * Dark/Light mode switching with persistence
 */

const ThemeToggle = {
  STORAGE_KEY: 'campus_security_theme',
  
  /**
   * Initialize theme toggle
   */
  init() {
    this.applyStoredTheme();
    this.bindEvents();
  },

  /**
   * Apply stored theme or detect system preference
   */
  applyStoredTheme() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (stored) {
      this.setTheme(stored);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  },

  /**
   * Bind click events to theme toggles
   */
  bindEvents() {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  },

  /**
   * Toggle between light and dark themes
   */
  toggle() {
    const current = document.documentElement.dataset.theme || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    localStorage.setItem(this.STORAGE_KEY, next);
    
    // Fire theme change event
    document.dispatchEvent(new CustomEvent('theme:change', { detail: { theme: next } }));
  },

  /**
   * Set specific theme
   * @param {string} theme - 'light' or 'dark'
   */
  setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    this.updateToggleIcons(theme);
  },

  /**
   * Update toggle button icons
   */
  updateToggleIcons(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const icon = btn.querySelector('.theme-icon') || btn;
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });
  },

  /**
   * Get current theme
   * @returns {string} 'light' or 'dark'
   */
  getCurrentTheme() {
    return document.documentElement.dataset.theme || 'light';
  },

  /**
   * Check if dark mode is active
   * @returns {boolean}
   */
  isDark() {
    return this.getCurrentTheme() === 'dark';
  }
};
