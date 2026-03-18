/* Auth Logic */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const btnText = loginBtn.querySelector('.btn-text');
  const loader = loginBtn.querySelector('.loader');

  // Validation patterns
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Real-time validation
  emailInput.addEventListener('input', () => validateEmail());
  passwordInput.addEventListener('input', () => validatePassword());

  function validateEmail() {
    const errorSpan = document.getElementById('emailError');
    if (!emailInput.value) {
      errorSpan.textContent = 'Email is required';
      return false;
    } else if (!emailPattern.test(emailInput.value)) {
      errorSpan.textContent = 'Please enter a valid email';
      return false;
    } else {
      errorSpan.textContent = '';
      return true;
    }
  }

  function validatePassword() {
    const errorSpan = document.getElementById('passwordError');
    if (!passwordInput.value) {
      errorSpan.textContent = 'Password is required';
      return false;
    } else if (passwordInput.value.length < 6) {
      errorSpan.textContent = 'Password must be at least 6 characters';
      return false;
    } else {
      errorSpan.textContent = '';
      return true;
    }
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateEmail() || !validatePassword()) {
      return;
    }

    // Simulate API call
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

      // Store session info
      const sessionData = {
        user: {
          email: emailInput.value,
          name: 'Security Officer',
          role: 'Guard'
        },
        loginTime: new Date().toISOString(),
        token: Utils.generateId()
      };

      Utils.session.set('currentUser', sessionData);
      
      // Redirect to camera interface
      window.location.href = 'camera.html';
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    if (isLoading) {
      loginBtn.disabled = true;
      btnText.classList.add('hidden');
      loader.classList.remove('hidden');
    } else {
      loginBtn.disabled = false;
      btnText.classList.remove('hidden');
      loader.classList.add('hidden');
    }
  }
});
