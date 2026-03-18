/* Utility Functions */

const Utils = {
  // Format date and time
  formatDate: (date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  },

  formatTime: (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  },

  // Generate random ID
  generateId: () => {
    return Math.random().toString(36).substr(2, 9);
  },

  // Debounce function
  debounce: (func, wait) => {
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

  // Local Storage wrapper
  storage: {
    get: (key) => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (e) {
        return null;
      }
    },
    set: (key, value) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    remove: (key) => {
      localStorage.removeItem(key);
    },
  },

  // Session Storage wrapper
  session: {
    get: (key) => {
      try {
        return JSON.parse(sessionStorage.getItem(key));
      } catch (e) {
        return null;
      }
    },
    set: (key, value) => {
      sessionStorage.setItem(key, JSON.stringify(value));
    },
    remove: (key) => {
      sessionStorage.removeItem(key);
    },
  },
};
