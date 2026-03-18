/**
 * ANPR Login System - UI Animations
 * Micro-interactions and animation effects
 */

'use strict';

/**
 * Animations Controller
 */
const Animations = {
  /**
   * Initialize all animations
   */
  init() {
    this.initPageLoad();
    this.initRippleEffect();
    this.initFormAnimations();
  },
  
  /**
   * Page load fade-in animation
   */
  initPageLoad() {
    const loginCard = document.querySelector('.login-card');
    const form = document.querySelector('.login-form');
    
    if (loginCard) {
      // Remove initially-hidden class and add fade-in
      loginCard.classList.remove('initially-hidden');
      loginCard.classList.add('animate-fade-in');
    }
    
    if (form) {
      form.classList.add('animate-stagger');
    }
    
    // Focus on first input after animation
    setTimeout(() => {
      const firstInput = document.querySelector('.form-input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 600);
  },
  
  /**
   * Button ripple effect
   */
  initRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.createRipple(e, button);
      });
    });
  },
  
  /**
   * Create ripple animation on element
   * @param {MouseEvent} e - Click event
   * @param {HTMLElement} element - Element to add ripple to
   */
  createRipple(e, element) {
    // Remove existing ripples
    const existingRipple = element.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  },
  
  /**
   * Initialize form animations
   */
  initFormAnimations() {
    const inputs = document.querySelectorAll('.form-input, .form-select');
    
    inputs.forEach(input => {
      // Focus animation
      input.addEventListener('focus', () => {
        const group = input.closest('.form-group');
        if (group) {
          group.classList.add('form-group--focused');
        }
      });
      
      input.addEventListener('blur', () => {
        const group = input.closest('.form-group');
        if (group) {
          group.classList.remove('form-group--focused');
        }
      });
    });
  },
  
  /**
   * Shake animation for form errors
   * @param {HTMLElement} element - Element to shake
   */
  shake(element) {
    element.classList.add('animate-shake');
    
    // Remove class after animation completes
    element.addEventListener('animationend', () => {
      element.classList.remove('animate-shake');
    }, { once: true });
  },
  
  /**
   * Show loading state on button
   * @param {HTMLButtonElement} button - Button element
   */
  showButtonLoading(button) {
    button.disabled = true;
    button.classList.add('btn--loading');
    
    // Create spinner if not exists
    if (!button.querySelector('.btn__spinner')) {
      const spinner = document.createElement('span');
      spinner.className = 'btn__spinner';
      button.appendChild(spinner);
    }
  },
  
  /**
   * Hide loading state on button
   * @param {HTMLButtonElement} button - Button element
   */
  hideButtonLoading(button) {
    button.disabled = false;
    button.classList.remove('btn--loading');
  },
  
  /**
   * Show success state on button
   * @param {HTMLButtonElement} button - Button element
   */
  showButtonSuccess(button) {
    button.classList.remove('btn--loading');
    button.classList.add('btn--success');
    
    // Create checkmark if not exists
    if (!button.querySelector('.btn__checkmark')) {
      const checkmark = document.createElement('svg');
      checkmark.className = 'btn__checkmark';
      checkmark.setAttribute('viewBox', '0 0 24 24');
      checkmark.setAttribute('fill', 'none');
      checkmark.setAttribute('stroke', 'currentColor');
      checkmark.setAttribute('stroke-width', '3');
      checkmark.innerHTML = '<path class="checkmark-icon" d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>';
      button.appendChild(checkmark);
    }
    
    button.classList.add('animate-checkmark');
  },
  
  /**
   * Reset button state
   * @param {HTMLButtonElement} button - Button element
   */
  resetButton(button) {
    button.disabled = false;
    button.classList.remove('btn--loading', 'btn--success', 'animate-checkmark');
    
    const spinner = button.querySelector('.btn__spinner');
    const checkmark = button.querySelector('.btn__checkmark');
    if (spinner) spinner.remove();
    if (checkmark) checkmark.remove();
  },
  
  /**
   * Show alert message
   * @param {string} message - Alert message
   * @param {string} type - 'error' or 'success'
   * @param {HTMLElement} container - Container to insert alert
   */
  showAlert(message, type, container) {
    // Remove existing alerts
    const existingAlert = container.querySelector('.alert');
    if (existingAlert) {
      existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert--${type}`;
    alert.setAttribute('role', 'alert');
    
    const iconPath = type === 'error' 
      ? 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
      : 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z';
    
    alert.innerHTML = `
      <svg class="alert__icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="${iconPath}" clip-rule="evenodd" />
      </svg>
      <span>${message}</span>
    `;
    
    container.insertBefore(alert, container.firstChild);
    
    // Auto-dismiss success alerts
    if (type === 'success') {
      setTimeout(() => {
        this.hideAlert(alert);
      }, 5000);
    }
    
    return alert;
  },
  
  /**
   * Hide alert with animation
   * @param {HTMLElement} alert - Alert element
   */
  hideAlert(alert) {
    if (!alert) return;
    
    alert.classList.add('alert--dismissing');
    
    alert.addEventListener('animationend', () => {
      alert.remove();
    }, { once: true });
  },
  
  /**
   * Show loading overlay
   */
  showLoadingOverlay() {
    let overlay = document.querySelector('.loading-overlay');
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="loading-overlay__spinner"></div>';
      document.body.appendChild(overlay);
    }
    
    requestAnimationFrame(() => {
      overlay.classList.add('loading-overlay--visible');
    });
  },
  
  /**
   * Hide loading overlay
   */
  hideLoadingOverlay() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.classList.remove('loading-overlay--visible');
    }
  },
  
  /**
   * Toggle password visibility with animation
   * @param {HTMLInputElement} input - Password input
   * @param {HTMLButtonElement} button - Toggle button
   */
  togglePasswordVisibility(input, button) {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    const showIcon = button.querySelector('.password-toggle__icon--show');
    const hideIcon = button.querySelector('.password-toggle__icon--hide');
    
    if (showIcon && hideIcon) {
      if (isPassword) {
        showIcon.style.display = 'none';
        hideIcon.style.display = 'block';
      } else {
        showIcon.style.display = 'block';
        hideIcon.style.display = 'none';
      }
    }
    
    button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Animations.init();
});

// Export for use in other modules
window.Animations = Animations;
