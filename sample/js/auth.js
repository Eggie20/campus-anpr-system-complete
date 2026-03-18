/**
 * ANPR Login System - Authentication
 * Updated with enhanced visual feedback strings
 */

'use strict';

const Auth = {
  init() {
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  },

  handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    // Validate
    if (window.Validation) {
        const result = window.Validation.validateForm(form);
        if (!result.valid) return;
    }

    // UX: Show loading
    const btn = form.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('span');
    
    btn.classList.add('btn-loading');
    btn.disabled = true;
    
    // Simulate phases
    // 1. Verifying
    // 2. Success/Fail
    
    setTimeout(() => {
       // Mock Failure/Success logic
       const isSuccess = Math.random() > 0.1; // 90% success chance for demo
       
       if (isSuccess) {
           btn.classList.remove('btn-loading');
           btn.classList.add('btn-success');
           btnText.innerText = "Success!";
           btnText.style.display = 'block'; // Unhide text
           
           // Redirect mock
           setTimeout(() => {
               alert("Redirecting to Dashboard...");
               window.location.reload();
           }, 1000);
       } else {
           btn.classList.remove('btn-loading');
           btn.disabled = false;
           btnText.style.display = 'block';
           
           if (window.Validation) {
               window.Validation.showFieldError(form.querySelector('#password'), "Invalid credentials");
           }
       }
    }, 1500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});
