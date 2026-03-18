/**
 * Admin Vehicles Page
 */

const AdminVehicles = {
  init() {
    this.bindEvents();
    console.log('[AdminVehicles] Initialized');
  },

  bindEvents() {
    // Search
    const searchInput = document.getElementById('vehicleSearch');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300));
    }

    // Add Vehicle Form
    const addVehicleForm = document.getElementById('addVehicleForm');
    if (addVehicleForm) {
      addVehicleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddVehicle(new FormData(e.target));
      });
    }
  },

  handleSearch(query) {
    console.log('[AdminVehicles] Searching:', query);
    const cards = document.querySelectorAll('.vehicle-card-enhanced');
    const q = query.toLowerCase();

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? 'block' : 'none';
      
      // Re-trigger animation if showing
      if (text.includes(q)) {
        card.style.animation = 'none';
        card.offsetHeight; // force reflow
        card.style.animation = 'fadeInUp 0.5s ease forwards';
      }
    });
  },

  async handleAddVehicle(formData) {
    const data = Object.fromEntries(formData.entries());
    console.log('[AdminVehicles] Adding vehicle:', data);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const modal = document.getElementById('addVehicleModal');
      if (modal) modal.classList.remove('open');
      document.body.style.overflow = '';

      if (typeof MockAPI !== 'undefined') {
        await MockAPI.createVehicle(data);
      }

      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Vehicle registered successfully', 'success');
      }
      
      document.getElementById('addVehicleForm').reset();
      
      // Reload or append mock card (skipped for now)
    } catch (error) {
      console.error(error);
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Failed to register vehicle', 'error');
      }
    }
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminVehicles.init();
});
