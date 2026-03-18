/**
 * App Initialization
 * Application bootstrap and DOM ready handler
 */

const App = {
  /**
   * Initialize the application
   */
  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.bootstrap());
    } else {
      this.bootstrap();
    }
  },

  /**
   * Bootstrap application after DOM ready
   */
  bootstrap() {
    console.log("[App] Initializing Campus Security System...");

    // Initialize core modules
    this.initTheme();
    this.initAccessibility(); // New accessibility module
    this.initSidebar();
    this.initMobileMenu();
    this.initDropdowns();
    this.initModals();
    this.initNotifications();
    this.addSidebarTooltips();

    // Fire ready event
    document.dispatchEvent(new CustomEvent("app:ready"));
    console.log("[App] Bootstrap complete");
  },

  /**
   * Initialize accessibility settings (Large Text)
   */
  initAccessibility() {
    // Check saved preference
    const isLargeText = localStorage.getItem("text_size") === "large";
    if (isLargeText) {
      document.documentElement.setAttribute("data-text-size", "large");
    }

    // Inject toggle button into header
    const headerRight = document.querySelector(".header-right");
    const themeToggle = document.querySelector("[data-theme-toggle]");
    
    if (headerRight && themeToggle) {
      const a11yBtn = document.createElement("button");
      a11yBtn.className = "btn btn-ghost btn-icon";
      a11yBtn.setAttribute("aria-label", "Toggle large text");
      a11yBtn.title = "Toggle Large Text";
      a11yBtn.innerHTML = '<span style="font-size: 1.2em; font-weight: bold;">Aa</span>';
      
      a11yBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-text-size");
        if (current === "large") {
          document.documentElement.removeAttribute("data-text-size");
          localStorage.removeItem("text_size");
        } else {
          document.documentElement.setAttribute("data-text-size", "large");
          localStorage.setItem("text_size", "large");
        }
      });

      // Insert before theme toggle
      headerRight.insertBefore(a11yBtn, themeToggle);
    }
  },

  /**
   * Initialize theme toggle
   */
  initTheme() {
    if (typeof ThemeToggle !== "undefined") {
      ThemeToggle.init();
    }
  },

  /**
   * Initialize sidebar toggle (hamburger works for both desktop collapse and mobile menu)
   */
  initSidebar() {
    const sidebar = document.querySelector(".app-sidebar");
    if (!sidebar) return;

    // Restore saved collapsed state (desktop only)
    const savedState = localStorage.getItem("sidebar_collapsed");
    if (savedState === "true" && window.innerWidth >= 1024) {
      sidebar.classList.add("collapsed");
    }
  },

  /**
   * Initialize mobile menu toggle (hamburger button)
   * Desktop: toggles collapsed state
   * Mobile: toggles open/close with overlay
   */
  initMobileMenu() {
    const sidebar = document.querySelector(".app-sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    const menuToggles = document.querySelectorAll("[data-mobile-menu-toggle]");
    const isMobile = () => window.innerWidth < 768;

    console.log("[App] Mobile menu init:", { 
      sidebar: !!sidebar, 
      overlay: !!overlay, 
      menuToggles: menuToggles.length 
    });

    // Function to update hamburger icon state
    const updateHamburgerState = () => {
      menuToggles.forEach((toggle) => {
        if (isMobile()) {
          // Mobile: X when sidebar is open
          const isOpen = sidebar?.classList.contains("open");
          toggle.classList.toggle("is-active", isOpen);
        } else {
          // Desktop: Arrow (Active) when sidebar is Collapsed
          // Hamburger (Inactive) when sidebar is Expanded
          const isCollapsed = sidebar?.classList.contains("collapsed");
          toggle.classList.toggle("is-active", isCollapsed);
        }
      });
    };

    menuToggles.forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("[App] Menu toggle clicked, isMobile:", isMobile());
        
        if (!sidebar) {
          console.error("[App] Sidebar not found!");
          return;
        }
        
        if (isMobile()) {
          // Mobile: slide in/out
          const isOpen = sidebar.classList.toggle("open");
          console.log("[App] Mobile sidebar toggled, isOpen:", isOpen);
          toggle.setAttribute("aria-expanded", isOpen);
          toggle.classList.toggle("is-active", isOpen);
          
          if (overlay) {
            if (isOpen) {
              overlay.classList.add("visible");
            } else {
              overlay.classList.remove("visible");
            }
          }
        } else {
          // Desktop: collapse/expand
          const isCollapsed = sidebar.classList.toggle("collapsed");
          console.log("[App] Desktop sidebar toggled, isCollapsed:", isCollapsed);
          
          // If Collapsed -> Show Arrow (Active)
          // If Expanded -> Show Hamburger (Not Active)
          toggle.setAttribute("aria-expanded", !isCollapsed);
          toggle.classList.toggle("is-active", isCollapsed);
          
          localStorage.setItem("sidebar_collapsed", isCollapsed);
        }
      });
    });

    // Handle overlay click (mobile)
    if (overlay) {
      overlay.addEventListener("click", () => {
        sidebar?.classList.remove("open");
        overlay.classList.remove("visible");
        menuToggles.forEach((t) => {
          t.setAttribute("aria-expanded", "false");
          t.classList.remove("is-active");
        });
      });
    }

    // Close sidebar close button (X)
    const closeBtn = sidebar?.querySelector(".sidebar-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay?.classList.remove("visible");
        menuToggles.forEach((t) => {
          t.setAttribute("aria-expanded", "false");
          t.classList.remove("is-active");
        });
      });
    }

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar?.classList.contains("open")) {
        sidebar.classList.remove("open");
        overlay?.classList.remove("visible");
        menuToggles.forEach((t) => {
          t.setAttribute("aria-expanded", "false");
          t.classList.remove("is-active");
        });
      }
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      if (!isMobile()) {
        sidebar?.classList.remove("open");
        overlay?.classList.remove("visible");
      }
      updateHamburgerState();
    });

    // Initialize state on load
    updateHamburgerState();
  },

  /**
   * Add tooltips to sidebar links for collapsed state
   */
  addSidebarTooltips() {
    document.querySelectorAll(".sidebar-link").forEach((link) => {
      const text = link.querySelector(".sidebar-text");
      if (text) {
        link.setAttribute("data-tooltip", text.textContent.trim());
      }
    });
  },

  /**
   * Initialize dropdown menus
   */
  initDropdowns() {
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      const trigger = dropdown.querySelector("[data-dropdown-trigger]");

      if (trigger) {
        trigger.addEventListener("click", (e) => {
          e.stopPropagation();

          // Close other dropdowns
          document.querySelectorAll(".dropdown.open").forEach((d) => {
            if (d !== dropdown) d.classList.remove("open");
          });

          dropdown.classList.toggle("open");
        });
      }
    });

    // Close dropdowns on outside click
    document.addEventListener("click", () => {
      document.querySelectorAll(".dropdown.open").forEach((d) => {
        d.classList.remove("open");
      });
    });
  },

  /**
   * Initialize modal functionality
   */
  initModals() {
    // Open modal triggers
    document.querySelectorAll("[data-modal-open]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const modalId = trigger.dataset.modalOpen;
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add("open");
          document.body.style.overflow = "hidden";
        }
      });
    });

    // Close modal triggers
    document.querySelectorAll("[data-modal-close]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const modal = trigger.closest(".modal-backdrop");
        if (modal) {
          modal.classList.remove("open");
          document.body.style.overflow = "";
        }
      });
    });

    // Close on backdrop click
    document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove("open");
          document.body.style.overflow = "";
        }
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const openModal = document.querySelector(".modal-backdrop.open");
        if (openModal) {
          openModal.classList.remove("open");
          document.body.style.overflow = "";
        }
      }
    });
  },

  /**
   * Initialize notification functionality
   */
  initNotifications() {
    const notifBtn = document.querySelector('[aria-label="Notifications"]');
    if (!notifBtn) return;

    // Get user role from page or state
    const role = this.getUserRole();
    
    // Get notifications for this role
    const notifications = this.getNotificationsForRole(role);
    
    // Update badge count
    const badge = notifBtn.querySelector(".badge");
    if (badge) {
      badge.textContent = notifications.length;
      if (notifications.length === 0) {
        badge.style.display = "none";
      }
    }

    // Create notification popup
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.showNotificationPopup(notifBtn, notifications, role);
    });
  },



  /**
   * Get current user role from page context
   */
  getUserRole() {
    const body = document.body;
    const pageTitle = document.title.toLowerCase();
    
    if (pageTitle.includes("admin")) return "admin";
    if (pageTitle.includes("security")) return "security";
    if (pageTitle.includes("faculty")) return "faculty";
    if (pageTitle.includes("student")) return "student";
    
    return "student";
  },

  /**
   * Get role-specific notifications
   */
  getNotificationsForRole(role) {
    const notifications = {
      student: [
        { title: "Vehicle Registered", message: "Your vehicle ABC 1234 is now active", time: "2 hrs ago", type: "success" },
        { title: "Entry Logged", message: "Vehicle detected at Main Gate", time: "Today 8:15 AM", type: "info" },
        { title: "Reminder", message: "Vehicle registration expires in 30 days", time: "Yesterday", type: "warning" }
      ],
      faculty: [
        { title: "Parking Update", message: "Your assigned slot is A-05", time: "1 hr ago", type: "info" },
        { title: "Entry Logged", message: "Vehicle detected at Faculty Parking", time: "Today 7:30 AM", type: "success" }
      ],
      admin: [
        { title: "New Registration", message: "3 new vehicle registrations pending", time: "30 min ago", type: "warning" },
        { title: "System Alert", message: "Camera Parking B is offline", time: "1 hr ago", type: "error" },
        { title: "User Created", message: "New user John Dela Cruz added", time: "2 hrs ago", type: "success" },
        { title: "Report Ready", message: "Monthly activity report generated", time: "Yesterday", type: "info" },
        { title: "Unregistered Vehicle", message: "5 unregistered detections today", time: "Today", type: "warning" }
      ],
      security: [
        { title: "Shift Started", message: "Your 8-hour shift has begun", time: "Now", type: "info" },
        { title: "Alert", message: "Unregistered vehicle at Main Gate", time: "5 min ago", type: "error" },
        { title: "Vehicle Authorized", message: "ABC 1234 - Dr. Maria Santos", time: "10 min ago", type: "success" }
      ]
    };
    
    return notifications[role] || [];
  },

  /**
   * Show notification popup
   */
  showNotificationPopup(button, notifications, role) {
    // Remove existing popup
    const existing = document.querySelector(".notification-popup");
    if (existing) {
      existing.remove();
      return;
    }

    const popup = document.createElement("div");
    popup.className = "notification-popup";
    popup.innerHTML = `
      <div class="notif-popup-header">
        <h4>Notifications</h4>
        <span class="notif-role-badge">${role}</span>
      </div>
      <div class="notif-popup-list">
        ${notifications.length === 0 ? '<p class="notif-empty">No notifications</p>' : 
          notifications.map(n => `
            <div class="notif-popup-item ${n.type}">
              <div class="notif-popup-icon">${this.getNotifIcon(n.type)}</div>
              <div class="notif-popup-content">
                <div class="notif-popup-title">${n.title}</div>
                <div class="notif-popup-message">${n.message}</div>
                <div class="notif-popup-time">${n.time}</div>
              </div>
            </div>
          `).join('')
        }
      </div>
      <div class="notif-popup-footer">
        <a href="#notifications">View All</a>
      </div>
    `;

    // Position popup
    popup.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      width: 320px;
      max-height: 400px;
      background: var(--bg-primary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      z-index: 1000;
      overflow: hidden;
      animation: slideInDown 0.2s ease;
    `;

    // Add popup styles if not exists
    if (!document.querySelector("#notif-popup-styles")) {
      const styles = document.createElement("style");
      styles.id = "notif-popup-styles";
      styles.textContent = `
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notif-popup-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notif-popup-header h4 { margin: 0; font-size: 14px; }
        .notif-role-badge {
          font-size: 10px;
          padding: 2px 8px;
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: 12px;
          text-transform: capitalize;
        }
        .notif-popup-list {
          max-height: 300px;
          overflow-y: auto;
        }
        .notif-popup-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-primary);
          transition: background 0.2s;
          cursor: pointer;
        }
        .notif-popup-item:hover { background: var(--surface-hover); }
        .notif-popup-item:last-child { border-bottom: none; }
        .notif-popup-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        .notif-popup-item.success .notif-popup-icon { background: rgba(34, 197, 94, 0.1); }
        .notif-popup-item.error .notif-popup-icon { background: rgba(239, 68, 68, 0.1); }
        .notif-popup-item.warning .notif-popup-icon { background: rgba(234, 179, 8, 0.1); }
        .notif-popup-item.info .notif-popup-icon { background: rgba(59, 130, 246, 0.1); }
        .notif-popup-content { flex: 1; min-width: 0; }
        .notif-popup-title { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
        .notif-popup-message { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .notif-popup-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
        .notif-popup-footer {
          padding: 12px 16px;
          border-top: 1px solid var(--border-primary);
          text-align: center;
        }
        .notif-popup-footer a {
          font-size: 13px;
          color: var(--color-primary);
          text-decoration: none;
        }
        .notif-popup-footer a:hover { text-decoration: underline; }
        .notif-empty { text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px; }
      `;
      document.head.appendChild(styles);
    }

    button.style.position = "relative";
    button.appendChild(popup);

    // Close on outside click
    setTimeout(() => {
      document.addEventListener("click", function closePopup(e) {
        if (!popup.contains(e.target) && e.target !== button) {
          popup.remove();
          document.removeEventListener("click", closePopup);
        }
      });
    }, 0);
  },

  /**
   * Get notification icon based on type
   */
  getNotifIcon(type) {
    const icons = { success: "✓", error: "⚠", warning: "!", info: "ℹ" };
    return icons[type] || "•";
  },

  /**
   * Show a toast notification
   */
  toast(message, type = "info", duration = 3000) {
    const container = this.getToastContainer();

    const toast = document.createElement("div");
    toast.className = `toast toast-${type} slide-in-right`;
    toast.innerHTML = `
      <span class="toast-icon">${this.getToastIcon(type)}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Close">×</button>
    `;

    container.appendChild(toast);

    toast.querySelector(".toast-close").addEventListener("click", () => {
      this.removeToast(toast);
    });

    setTimeout(() => this.removeToast(toast), duration);
  },

  getToastContainer() {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  },

  removeToast(toast) {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  },

  getToastIcon(type) {
    const icons = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };
    return icons[type] || icons.info;
  },
};

// Auto-initialize
App.init();
