/**
 * App State
 * LocalStorage-based state management
 */

const AppState = {
  STORAGE_KEY: 'campus_security_state',
  
  /**
   * Default state structure
   */
  defaultState: {
    user: null,
    notifications: [],
    preferences: {
      sidebarCollapsed: false,
      theme: 'dark'
    }
  },

  /**
   * Get the full state object
   * @returns {Object} Current state
   */
  getState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...this.defaultState, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('[AppState] Failed to parse state:', e);
    }
    return { ...this.defaultState };
  },

  /**
   * Set the full state object
   * @param {Object} state - New state
   */
  setState(state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      this.notify('state:change', state);
    } catch (e) {
      console.error('[AppState] Failed to save state:', e);
    }
  },

  /**
   * Get a specific key from state
   * @param {string} key - Dot notation path (e.g., 'user.name')
   * @param {*} defaultValue - Default if not found
   * @returns {*} Value at path
   */
  get(key, defaultValue = null) {
    const state = this.getState();
    const keys = key.split('.');
    let value = state;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value ?? defaultValue;
  },

  /**
   * Set a specific key in state
   * @param {string} key - Dot notation path
   * @param {*} value - Value to set
   */
  set(key, value) {
    const state = this.getState();
    const keys = key.split('.');
    let current = state;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
    this.setState(state);
    this.notify(`state:${key}`, value);
  },

  /**
   * Remove a key from state
   * @param {string} key - Key to remove
   */
  remove(key) {
    const state = this.getState();
    const keys = key.split('.');
    let current = state;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) return;
      current = current[keys[i]];
    }
    
    delete current[keys[keys.length - 1]];
    this.setState(state);
  },

  /**
   * Clear all state
   */
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.notify('state:clear', null);
  },

  /**
   * Notify listeners of state change
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  notify(event, data) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },

  /**
   * Subscribe to state changes
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  subscribe(event, callback) {
    document.addEventListener(event, (e) => callback(e.detail));
  },

  // ===== User State Helpers =====
  
  /**
   * Set current user
   * @param {Object} user - User object
   */
  setUser(user) {
    this.set('user', user);
  },

  /**
   * Get current user
   * @returns {Object|null}
   */
  getUser() {
    return this.get('user');
  },

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!this.getUser();
  },

  /**
   * Get user role
   * @returns {string|null}
   */
  getUserRole() {
    return this.get('user.role');
  },

  /**
   * Logout user
   */
  logout() {
    this.remove('user');
    window.location.href = '/login.html';
  },

  // ===== Notification Helpers =====

  /**
   * Add notification
   * @param {Object} notification - Notification object
   */
  addNotification(notification) {
    const notifications = this.get('notifications', []);
    notification.id = notification.id || Date.now();
    notification.timestamp = notification.timestamp || new Date().toISOString();
    notification.read = false;
    notifications.unshift(notification);
    this.set('notifications', notifications.slice(0, 50)); // Keep last 50
  },

  /**
   * Get notifications
   * @param {boolean} unreadOnly - Filter unread only
   * @returns {Array}
   */
  getNotifications(unreadOnly = false) {
    const notifications = this.get('notifications', []);
    return unreadOnly ? notifications.filter(n => !n.read) : notifications;
  },

  /**
   * Mark notification as read
   * @param {number} id - Notification ID
   */
  markNotificationRead(id) {
    const notifications = this.get('notifications', []);
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.set('notifications', notifications);
    }
  },

  /**
   * Get unread notification count
   * @returns {number}
   */
  getUnreadCount() {
    return this.getNotifications(true).length;
  }
};
