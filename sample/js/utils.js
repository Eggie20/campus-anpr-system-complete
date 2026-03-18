/**
 * ANPR Login System - Utility Functions
 * Helper functions used across the application
 */

"use strict";

/**
 * Debounce function - limits how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - ensures function is called at most once in specified time
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 100) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sanitize input - removes potentially dangerous characters
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== "string") return "";

  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  return input.replace(/[&<>"'`=/]/g, (char) => map[char]);
}

/**
 * Generate a CSRF token
 * @returns {string} Random CSRF token
 */
function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Set CSRF token in form and localStorage
 * @param {HTMLFormElement} form - Form element
 */
function setCSRFToken(form) {
  const token = generateCSRFToken();
  const input = form.querySelector('input[name="csrf_token"]');
  if (input) {
    input.value = token;
  }
  localStorage.setItem("csrf_token", token);
}

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} Is token valid
 */
function validateCSRFToken(token) {
  const storedToken = localStorage.getItem("csrf_token");
  return token === storedToken;
}

/**
 * LocalStorage helper - get with default value
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored value or default
 */
function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * LocalStorage helper - set value
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * LocalStorage helper - remove key
 * @param {string} key - Storage key
 */
function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Format error message for display
 * @param {string} field - Field name
 * @param {string} type - Error type
 * @returns {string} Formatted error message
 */
function formatErrorMessage(field, type) {
  const messages = {
    required: `${field} is required`,
    email: "Please enter a valid email address",
    password: "Password must be at least 8 characters",
    passwordStrength:
      "Password must contain uppercase, lowercase, number, and special character",
    match: "Passwords do not match",
    role: "Please select a role",
    generic: "Invalid input",
  };

  return messages[type] || messages.generic;
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Is element in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Add accessible announcement for screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
function announce(message, priority = "polite") {
  const announcer = document.getElementById("announcer") || createAnnouncer();
  announcer.setAttribute("aria-live", priority);
  announcer.textContent = "";

  // Small delay to ensure the change is announced
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
}

/**
 * Create screen reader announcer element
 * @returns {HTMLElement} Announcer element
 */
function createAnnouncer() {
  const announcer = document.createElement("div");
  announcer.id = "announcer";
  announcer.className = "visually-hidden";
  announcer.setAttribute("aria-live", "polite");
  announcer.setAttribute("aria-atomic", "true");
  document.body.appendChild(announcer);
  return announcer;
}

/**
 * Focus trap for modals
 * @param {HTMLElement} container - Container element
 * @returns {Object} Trap control object
 */
function createFocusTrap(container) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleKeyDown(e) {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  return {
    activate() {
      container.addEventListener("keydown", handleKeyDown);
      firstElement?.focus();
    },
    deactivate() {
      container.removeEventListener("keydown", handleKeyDown);
    },
  };
}

/**
 * Get current timestamp
 * @returns {number} Current timestamp
 */
function getTimestamp() {
  return Date.now();
}

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Timestamp to format
 * @returns {string} Formatted date string
 */
function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Export functions for use in other modules
window.Utils = {
  debounce,
  throttle,
  sanitizeInput,
  generateCSRFToken,
  setCSRFToken,
  validateCSRFToken,
  getStorage,
  setStorage,
  removeStorage,
  formatErrorMessage,
  isInViewport,
  announce,
  createFocusTrap,
  getTimestamp,
  formatTimestamp,
  generateId,
  delay,
};
