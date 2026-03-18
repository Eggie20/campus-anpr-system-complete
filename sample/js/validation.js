/**
 * ANPR Login System - Form Validation
 * Includes Student ID validation support
 */

'use strict';

const ValidationRules = {
  email: {
    // Modified regex to accept alphanumeric (Student IDs) OR standard emails
    pattern: /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[a-zA-Z0-9]+)$/,
    message: 'Please enter a valid email or Student ID'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: 'Password must be 8+ chars with uppercase, number & symbol'
  }
};

/* 
  Reusing existing validation logic structure but with updated patterns 
  and error display handling for Floating Labels 
*/

function validateEmail(email) {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, message: 'Email or ID is required' };
  
  // Logic: Check if it looks like an email or a simple ID
  const isEmail = trimmed.includes('@');
  if (isEmail) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(trimmed)) return { valid: false, message: 'Invalid email format' };
  } else {
      // Assume ID - must be alphanumeric, min 5 chars
      if (trimmed.length < 5) return { valid: false, message: 'ID number is too short' };
  }
  
  return { valid: true, message: '' };
}

function showFieldError(field, message) {
  field.classList.add('shake');
  // In the new design, we might show a tooltip or toast, 
  // but for now, add a red border and rely on the shake animation
  
  // Create or update error message element below input
  let errorMsg = field.parentElement.querySelector('.error-text');
  if (!errorMsg) {
    errorMsg = document.createElement('div');
    errorMsg.className = 'error-text';
    errorMsg.style.color = 'var(--color-error)';
    errorMsg.style.fontSize = '0.75rem';
    errorMsg.style.marginTop = '0.25rem';
    errorMsg.style.marginLeft = '1rem';
    field.parentElement.appendChild(errorMsg);
  }
  errorMsg.textContent = message;
  
  // Remove shake class after animation
  setTimeout(() => {
    field.classList.remove('shake');
  }, 500);
}

function clearFieldError(field) {
  field.classList.remove('shake');
  field.style.borderColor = '';
  const errorMsg = field.parentElement.querySelector('.error-text');
  if (errorMsg) errorMsg.remove();
}

function validateForm(form) {
    let isValid = true;
    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');
    
    // Clear previous errors
    if(emailInput) clearFieldError(emailInput);
    if(passwordInput) clearFieldError(passwordInput);

    if (emailInput) {
        const emailRes = validateEmail(emailInput.value);
        if (!emailRes.valid) {
            showFieldError(emailInput, emailRes.message);
            isValid = false;
        }
    }
    
    if (passwordInput && !passwordInput.value) {
        showFieldError(passwordInput, 'Password is required');
        isValid = false;
    }
    
    return { valid: isValid }; // Simplified return for new auth logic
}


window.Validation = {
  validateEmail,
  validateForm,
  showFieldError,
  clearFieldError
};
