/**
 * Faculty Dashboard
 * Dashboard functionality for faculty users
 */

const FacultyDashboard = {
  /**
   * Initialize faculty dashboard
   */
  init() {
    console.log('[FacultyDashboard] Initializing...');
    this.loadUserData();
    this.bindEvents();
  },

  /**
   * Load user data
   */
  async loadUserData() {
    try {
      let user = AppState.getUser();
      
      if (!user) {
        // Mock faculty user for demo
        user = {
          id: 2,
          name: 'Dr. Maria Santos',
          email: 'faculty@csu.edu.ph',
          role: 'faculty',
          department: 'Computer Science'
        };
        AppState.setUser(user);
      }
      
      // Update UI
      const userNameEl = document.getElementById('userName');
      if (userNameEl) {
        userNameEl.textContent = user.name.split(' ').slice(0, 2).join(' ');
      }
      
    } catch (error) {
      console.error('[FacultyDashboard] Failed to load user:', error);
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
  },

  /**
   * Handle sidebar navigation
   */
  handleNavigation(section) {
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.remove('active');
      if (item.querySelector(`[href="#${section}"]`)) {
        item.classList.add('active');
      }
    });
    
    console.log('[FacultyDashboard] Navigating to:', section);
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  FacultyDashboard.init();
});
