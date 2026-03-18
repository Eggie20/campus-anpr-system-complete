/**
 * Student Dashboard
 * Dashboard functionality for student users
 */

const StudentDashboard = {
  /**
   * Initialize student dashboard
   */
  init() {
    console.log('[StudentDashboard] Initializing...');
    this.loadUserData();
    this.loadStats();
    this.loadVehicleLogs();
    this.bindEvents();
  },

  /**
   * Load user data from state or mock API
   */
  async loadUserData() {
    try {
      // Try to get from state first
      let user = AppState.getUser();
      
      if (!user) {
        // Mock user for demo
        user = {
          id: 3,
          name: 'John Dela Cruz',
          email: 'student@csu.edu.ph',
          role: 'student',
          studentId: '2024-0001'
        };
        AppState.setUser(user);
      }
      
      // Update UI
      const userNameEl = document.getElementById('userName');
      const profileNameEl = document.getElementById('profileName');
      const profileIdEl = document.getElementById('profileId');
      
      if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];
      if (profileNameEl) profileNameEl.textContent = user.name;
      if (profileIdEl) profileIdEl.textContent = user.studentId || user.email;
      
    } catch (error) {
      console.error('[StudentDashboard] Failed to load user:', error);
    }
  },

  /**
   * Load dashboard stats from mock API
   */
  async loadStats() {
    try {
      const response = await MockAPI.getDashboardStats('student');
      const stats = response.data;
      
      // Update stat cards
      this.updateStat('vehicleCount', stats.myVehicles || 2);
      this.updateStat('entryCount', stats.todayEntries || 15);
      this.updateStat('exitCount', stats.todayExits || 14);
      this.updateStat('alertCount', 0);
      
    } catch (error) {
      console.error('[StudentDashboard] Failed to load stats:', error);
    }
  },

  /**
   * Update a stat value with animation
   */
  updateStat(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = value;
      el.classList.add('count-animate');
      setTimeout(() => el.classList.remove('count-animate'), 300);
    }
  },

  /**
   * Load vehicle logs from mock API
   */
  async loadVehicleLogs() {
    try {
      const response = await MockAPI.getVehicleLogs();
      const logs = response.data;
      
      const tbody = document.getElementById('logTableBody');
      if (!tbody || !logs.length) return;
      
      // For demo, use the sample data already in HTML
      // In real app, would render logs dynamically
      console.log('[StudentDashboard] Loaded', logs.length, 'vehicle logs');
      
    } catch (error) {
      console.error('[StudentDashboard] Failed to load logs:', error);
    }
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          this.handleNavigation(href.slice(1));
        }
      });
    });

    // Listen for notifications
    document.addEventListener('notification:new', (e) => {
      this.handleNewNotification(e.detail);
    });
  },

  /**
   * Handle sidebar navigation
   */
  handleNavigation(section) {
    // Update active state
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.remove('active');
      if (item.querySelector(`[href="#${section}"]`)) {
        item.classList.add('active');
      }
    });
    
    console.log('[StudentDashboard] Navigating to:', section);
    // In a full SPA, would show/hide sections here
  },

  /**
   * Handle new notification
   */
  handleNewNotification(notification) {
    // Update badge count
    const badge = document.getElementById('notificationBadge');
    if (badge) {
      const count = parseInt(badge.textContent) + 1;
      badge.textContent = count;
    }
    
    // Show toast
    if (typeof App !== 'undefined' && App.toast) {
      App.toast(notification.message, notification.type || 'info');
    }
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  StudentDashboard.init();
});
