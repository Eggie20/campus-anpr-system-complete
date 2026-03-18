/**
 * Admin Security Page
 */

const AdminSecurity = {
  init() {
    this.bindEvents();
    console.log('[AdminSecurity] Initialized');
  },

  bindEvents() {
    const searchInput = document.getElementById('staffSearch');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300));
    }
  },

  handleSearch(query) {
    console.log('[AdminSecurity] Searching:', query);
    const cards = document.querySelectorAll('.staff-card');
    const q = query.toLowerCase();

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? 'block' : 'none';
    });
  },

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
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminSecurity.init();
});
