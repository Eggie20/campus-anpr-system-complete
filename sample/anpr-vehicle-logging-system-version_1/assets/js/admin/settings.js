/**
 * Admin Settings Page
 */

const AdminSettings = {
  init() {
    this.bindEvents();
    console.log('[AdminSettings] Initialized');
  },

  bindEvents() {
    // Toggles
    const toggles = document.querySelectorAll('.toggle-switch input');
    toggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        this.handleToggle(e.target);
      });
    });

    // Save Buttons
    const saveBtns = document.querySelectorAll('button:not([data-modal-close])');
    saveBtns.forEach(btn => {
      if (btn.textContent.includes('Save')) {
        btn.addEventListener('click', () => this.handleSave());
      }
      if (btn.textContent.includes('Reset')) {
        btn.addEventListener('click', () => this.handleReset());
      }
    });
  },

  handleToggle(toggle) {
    const label = toggle.closest('.settings-row')?.querySelector('.settings-row__label')?.textContent || 'Setting';
    const state = toggle.checked ? 'enabled' : 'disabled';
    console.log(`[AdminSettings] ${label} ${state}`);
    
    if (typeof App !== 'undefined' && App.toast) {
      // App.toast(`${label} ${state}`, 'info');
    }
  },

  async handleSave() {
    const btn = document.querySelector('button.btn-primary');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = 'Saving...';
      btn.disabled = true;

      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (typeof App !== 'undefined' && App.toast) {
          App.toast('Settings saved successfully', 'success');
        }
      } catch (error) {
        if (typeof App !== 'undefined' && App.toast) {
          App.toast('Failed to save settings', 'error');
        }
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }
  },

  handleReset() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Settings reset to defaults', 'info');
      }
      location.reload();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminSettings.init();
});
