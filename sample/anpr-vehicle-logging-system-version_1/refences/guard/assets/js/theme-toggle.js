/* Theme Toggle Logic */

class ThemeManager {
  constructor() {
    this.themeKey = 'csu-security-theme';
    this.init();
  }

  init() {
    const savedTheme = Utils.storage.get(this.themeKey);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else if (systemPrefersDark) {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!Utils.storage.get(this.themeKey)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    Utils.storage.set(this.themeKey, theme);
    this.updateToggleButtons(theme);
  }

  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  updateToggleButtons(theme) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
      // Update icon or state if needed
      if (theme === 'dark') {
        toggle.classList.add('active');
        toggle.setAttribute('aria-label', 'Switch to light mode');
        toggle.innerHTML = '☀️'; // Sun icon
      } else {
        toggle.classList.remove('active');
        toggle.setAttribute('aria-label', 'Switch to dark mode');
        toggle.innerHTML = '🌙'; // Moon icon
      }
    });
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});
