/**
 * Admin Cameras Page
 */

const AdminCameras = {
  init() {
    this.bindEvents();
    this.startSimulation();
    console.log('[AdminCameras] Initialized');
  },

  bindEvents() {
    // Add Camera Button
    const addBtn = document.querySelector('button[data-modal-open="addCameraModal"]');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        console.log('[AdminCameras] Open add camera modal');
        // Modal handling via app.init.js
      });
    }
  },

  startSimulation() {
    // Simulate random status updates
    setInterval(() => {
      const statuses = document.querySelectorAll('.camera-card__status-dot');
      if (statuses.length === 0) return;
      
      const randomIdx = Math.floor(Math.random() * statuses.length);
      const dot = statuses[randomIdx];
      
      // Toggle offline briefly
      if (Math.random() > 0.8) {
        dot.classList.remove('camera-card__status-dot--online');
        dot.classList.add('camera-card__status-dot--offline');
        
        setTimeout(() => {
          dot.classList.remove('camera-card__status-dot--offline');
          dot.classList.add('camera-card__status-dot--online');
        }, 3000);
      }
    }, 5000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminCameras.init();
});
