/**
 * ANPR Login System - Dark Mode
 * Updated for improved reliability
 */

const DarkMode = {
  toggleBtn: null,
  
  init() {
    this.toggleBtn = document.getElementById('theme-toggle');
    
    // Check local storage or system preference
    const storedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && systemDark)) {
      document.body.classList.add('dark-mode');
    }
    
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        this.savePreference();
      });
    }
    
    // Mobile toggle support if present
    const mobileToggle = document.getElementById('mobile-theme-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            this.savePreference();
        });
    }
  },
  
  savePreference() {
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  DarkMode.init();
});
