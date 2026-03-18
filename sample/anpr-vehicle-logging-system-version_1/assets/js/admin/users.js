/**
 * Admin Users Page
 * User management functionality
 */

const AdminUsers = {
  init() {
    this.bindEvents();
    console.log('[AdminUsers] Initialized');
  },

  bindEvents() {
    // Search
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300));
    }

    // Role Filter
    const roleFilter = document.getElementById('roleFilter');
    if (roleFilter) {
      roleFilter.addEventListener('change', (e) => {
        this.handleFilter('role', e.target.value);
      });
    }

    // Status Filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.handleFilter('status', e.target.value);
      });
    }

    // Add User Form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
      addUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddUser(new FormData(e.target));
      });
    }

    // Table Actions (using delegation)
    const tableBody = document.getElementById('usersTableBody');
    if (tableBody) {
      tableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        if (btn.textContent.includes('👁️')) this.viewUser(btn);
        if (btn.textContent.includes('✏️')) this.editUser(btn);
        if (btn.textContent.includes('🗑️')) this.deleteUser(btn);
      });
    }
  },

  handleSearch(query) {
    console.log('[AdminUsers] Searching:', query);
    // TODO: Implement search logic
    if (typeof App !== 'undefined' && App.toast) {
      // App.toast('Searching users...', 'info'); // Commented out to reduce noise
    }
  },

  handleFilter(type, value) {
    console.log(`[AdminUsers] Filter ${type}:`, value);
    // TODO: Implement filter logic
  },

  async handleAddUser(formData) {
    const userData = Object.fromEntries(formData.entries());
    console.log('[AdminUsers] Adding user:', userData);

    try {
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const modal = document.getElementById('addUserModal');
      if (modal) modal.classList.remove('open');
      document.body.style.overflow = '';
      
      if (typeof MockAPI !== 'undefined') {
        await MockAPI.createUser(userData);
      }

      if (typeof App !== 'undefined' && App.toast) {
        App.toast('User added successfully', 'success');
      }
      
      document.getElementById('addUserForm').reset();
    } catch (error) {
      console.error(error);
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Failed to add user', 'error');
      }
    }
  },

  viewUser(btn) {
    const row = btn.closest('tr');
    const name = row.querySelector('.font-medium').textContent;
    alert(`View user: ${name}`);
  },

  editUser(btn) {
    const row = btn.closest('tr');
    const name = row.querySelector('.font-medium').textContent;
    alert(`Edit user: ${name}`);
  },

  deleteUser(btn) {
    const row = btn.closest('tr');
    const name = row.querySelector('.font-medium').textContent;
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      row.style.opacity = '0';
      setTimeout(() => row.remove(), 300);
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('User deleted', 'success');
      }
    }
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
  AdminUsers.init();
});
