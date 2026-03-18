/**
 * Admin Logs Page
 */

const AdminLogs = {
  init() {
    this.bindEvents();
    console.log('[AdminLogs] Initialized');
  },

  bindEvents() {
    const searchInput = document.getElementById('logSearch');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300));
    }
  },

  handleSearch(query) {
    console.log('[AdminLogs] Searching:', query);
    const rows = document.querySelectorAll('.data-table tbody tr');
    const q = query.toLowerCase();

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? '' : 'none';
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
  AdminLogs.init();
});
