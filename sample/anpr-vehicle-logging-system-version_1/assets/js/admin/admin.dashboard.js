/**
 * Admin Dashboard
 * Admin panel functionality with CRUD operations
 */

const AdminDashboard = {
  currentTab: 'users',
  
  /**
   * Initialize admin dashboard
   */
  init() {
    console.log('[AdminDashboard] Initializing...');
    this.loadStats();
    this.bindEvents();
    this.initTabs();
  },

  /**
   * Load dashboard stats
   */
  async loadStats() {
    try {
      const response = await MockAPI.getDashboardStats('admin');
      const stats = response.data;
      
      this.animateCounter('totalUsers', stats.totalUsers);
      this.animateCounter('totalVehicles', stats.registeredVehicles);
      this.animateCounter('totalCameras', stats.onlineCameras);
      this.animateCounter('todayAlerts', stats.unregisteredAlerts);
      
    } catch (error) {
      console.error('[AdminDashboard] Failed to load stats:', error);
    }
  },

  /**
   * Animate counter from 0 to value
   */
  animateCounter(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    let current = 0;
    const increment = Math.ceil(targetValue / 20);
    const interval = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        current = targetValue;
        clearInterval(interval);
      }
      el.textContent = current;
    }, 50);
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Search input
    const searchInput = document.querySelector('.crud-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300));
    }

    // Filter select
    const filterSelect = document.querySelector('.crud-filter select');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.handleFilter(e.target.value);
      });
    }

    // CRUD actions
    document.querySelectorAll('.crud-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (btn.classList.contains('view')) {
          this.viewItem(row);
        } else if (btn.classList.contains('edit')) {
          this.editItem(row);
        } else if (btn.classList.contains('delete')) {
          this.deleteItem(row);
        }
      });
    });

    // Add user form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
      addUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddUser(e.target);
      });
    }

    // Pagination
    document.querySelectorAll('.pagination-btn:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handlePagination(btn);
      });
    });
  },

  /**
   * Initialize tabs
   */
  initTabs() {
    // Show users tab by default
    this.switchTab('users');
  },

  /**
   * Switch between tabs
   */
  switchTab(tabName) {
    this.currentTab = tabName;
    
    // Update tab active states
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Load data for the tab
    this.loadTabData(tabName);
    
    console.log('[AdminDashboard] Switched to tab:', tabName);
  },

  /**
   * Load data for current tab
   */
  async loadTabData(tabName) {
    try {
      switch (tabName) {
        case 'users':
          const usersResponse = await MockAPI.getUsers();
          console.log('[AdminDashboard] Loaded users:', usersResponse.data.length);
          break;
        case 'vehicles':
          const vehiclesResponse = await MockAPI.getVehicles();
          console.log('[AdminDashboard] Loaded vehicles:', vehiclesResponse.data.length);
          break;
        case 'cameras':
          const camerasResponse = await MockAPI.getCameras();
          console.log('[AdminDashboard] Loaded cameras:', camerasResponse.data.length);
          break;
      }
    } catch (error) {
      console.error('[AdminDashboard] Failed to load tab data:', error);
    }
  },

  /**
   * Handle search input
   */
  handleSearch(query) {
    console.log('[AdminDashboard] Searching:', query);
    // In real app, would filter table rows or make API call
  },

  /**
   * Handle filter change
   */
  handleFilter(value) {
    console.log('[AdminDashboard] Filtering by:', value);
    // In real app, would filter table rows or make API call
  },

  /**
   * View item details
   */
  viewItem(row) {
    const name = row.querySelector('.crud-user-name')?.textContent;
    console.log('[AdminDashboard] Viewing:', name);
    
    if (typeof App !== 'undefined' && App.toast) {
      App.toast(`Viewing profile: ${name}`, 'info');
    }
  },

  /**
   * Edit item
   */
  editItem(row) {
    const name = row.querySelector('.crud-user-name')?.textContent;
    console.log('[AdminDashboard] Editing:', name);
    
    if (typeof App !== 'undefined' && App.toast) {
      App.toast(`Editing: ${name}`, 'info');
    }
  },

  /**
   * Delete item
   */
  deleteItem(row) {
    const name = row.querySelector('.crud-user-name')?.textContent;
    
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      row.classList.add('fade-out');
      setTimeout(() => row.remove(), 300);
      
      if (typeof App !== 'undefined' && App.toast) {
        App.toast(`Deleted: ${name}`, 'success');
      }
    }
  },

  /**
   * Handle add user form submission
   */
  async handleAddUser(form) {
    const formData = new FormData(form);
    const userData = {
      name: form.querySelector('input[type="text"]')?.value,
      email: form.querySelector('input[type="email"]')?.value,
      role: form.querySelector('select')?.value
    };
    
    try {
      await MockAPI.createUser(userData);
      
      // Close modal
      const modal = document.getElementById('addUserModal');
      modal?.classList.remove('open');
      document.body.style.overflow = '';
      
      // Reset form
      form.reset();
      
      // Show success message
      if (typeof App !== 'undefined' && App.toast) {
        App.toast(`User ${userData.name} added successfully!`, 'success');
      }
      
      // Refresh stats
      this.loadStats();
      
    } catch (error) {
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Failed to add user. Please try again.', 'error');
      }
    }
  },

  /**
   * Handle pagination click
   */
  handlePagination(btn) {
    document.querySelectorAll('.pagination-btn').forEach(b => {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    
    console.log('[AdminDashboard] Page:', btn.textContent);
  },

  /**
   * Debounce utility
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
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  AdminDashboard.init();
});
