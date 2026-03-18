/**
 * Responsive Helper
 * Breakpoint detection and responsive utilities
 */

const ResponsiveHelper = {
  // Breakpoints matching CSS
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },

  /**
   * Initialize responsive helpers
   */
  init() {
    this.handleResize();
    window.addEventListener('resize', this.debounce(() => this.handleResize(), 150));
  },

  /**
   * Handle window resize
   */
  handleResize() {
    const width = window.innerWidth;
    const breakpoint = this.getCurrentBreakpoint();
    
    // Update body classes
    document.body.classList.remove('is-mobile', 'is-tablet', 'is-desktop', 'is-large');
    
    if (width < this.breakpoints.md) {
      document.body.classList.add('is-mobile');
    } else if (width < this.breakpoints.lg) {
      document.body.classList.add('is-tablet');
    } else if (width < this.breakpoints.xl) {
      document.body.classList.add('is-desktop');
    } else {
      document.body.classList.add('is-large');
    }

    // Fire resize event
    document.dispatchEvent(new CustomEvent('responsive:change', { 
      detail: { width, breakpoint, isMobile: this.isMobile() } 
    }));
  },

  /**
   * Get current breakpoint name
   * @returns {string}
   */
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    if (width >= this.breakpoints['2xl']) return '2xl';
    if (width >= this.breakpoints.xl) return 'xl';
    if (width >= this.breakpoints.lg) return 'lg';
    if (width >= this.breakpoints.md) return 'md';
    if (width >= this.breakpoints.sm) return 'sm';
    return 'xs';
  },

  /**
   * Check if screen is mobile width
   * @returns {boolean}
   */
  isMobile() {
    return window.innerWidth < this.breakpoints.md;
  },

  /**
   * Check if screen is tablet width
   * @returns {boolean}
   */
  isTablet() {
    return window.innerWidth >= this.breakpoints.md && window.innerWidth < this.breakpoints.lg;
  },

  /**
   * Check if screen is desktop width
   * @returns {boolean}
   */
  isDesktop() {
    return window.innerWidth >= this.breakpoints.lg;
  },

  /**
   * Check if screen matches or exceeds breakpoint
   * @param {string} breakpoint - Breakpoint name
   * @returns {boolean}
   */
  isAtLeast(breakpoint) {
    return window.innerWidth >= (this.breakpoints[breakpoint] || 0);
  },

  /**
   * Initialize mobile menu toggle
   */
  initMobileMenu() {
    const menuToggle = document.querySelector('[data-mobile-menu-toggle]');
    const sidebar = document.querySelector('.app-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        const isOpen = sidebar.classList.toggle('open');
        overlay?.classList.toggle('visible', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen);
      });
    }
  },

  /**
   * Debounce utility
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function}
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle utility
   * @param {Function} func - Function to throttle
   * @param {number} limit - Minimum time between calls
   * @returns {Function}
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  ResponsiveHelper.init();
  // Note: initMobileMenu is handled by app.init.js to avoid duplicate event handlers
});
