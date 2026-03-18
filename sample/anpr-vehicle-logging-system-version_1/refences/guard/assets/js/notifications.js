/* Notification System Logic */

class NotificationSystem {
  constructor() {
    this.listElement = document.getElementById('notificationList');
    this.counters = {
      car: 245,
      van: 87,
      motor: 156,
      truck: 34
    };
    this.recentIncrements = {
      car: 12,
      van: 3,
      motor: 8,
      truck: 1
    };
    
    this.init();
  }

  init() {
    // Start random counter updates
    setInterval(() => this.randomUpdate(), 3000);
  }

  addNotification(type, data = {}) {
    let html = '';
    const time = Utils.formatTime(new Date());

    switch(type) {
      case 'unregistered':
        html = `
          <div class="notification-item warning fade-in">
            <div class="notif-icon">⚠</div>
            <div class="notif-content">
              <div class="notif-title">Unregistered Vehicle</div>
              <div class="notif-desc">License Plate: ABC-1234 not found in database.</div>
            </div>
            <div class="notif-time">${time}</div>
          </div>
        `;
        break;
      case 'multiple':
        html = `
          <div class="notification-item warning fade-in">
            <div class="notif-icon">⚠</div>
            <div class="notif-content">
              <div class="notif-title">Multiple Vehicles</div>
              <div class="notif-desc">User ID #4521 attempting entry with second vehicle.</div>
            </div>
            <div class="notif-time">${time}</div>
          </div>
        `;
        break;
      case 'unauthorized':
        html = `
          <div class="notification-item danger fade-in">
            <div class="notif-icon">🚨</div>
            <div class="notif-content">
              <div class="notif-title">Unauthorized Access</div>
              <div class="notif-desc">Blocked ID #9988 attempted entry at Gate B.</div>
            </div>
            <div class="notif-time">${time}</div>
          </div>
        `;
        break;
      case 'exception':
        html = `
          <div class="notification-item success fade-in">
            <div class="notif-icon">✓</div>
            <div class="notif-content">
              <div class="notif-title">Exception Granted</div>
              <div class="notif-desc">Guest entry approved by Admin.</div>
            </div>
            <div class="notif-time">${time}</div>
          </div>
        `;
        break;
      case 'verification':
        html = `
          <div class="notification-item warning fade-in">
            <div class="notif-icon">👁️</div>
            <div class="notif-content">
              <div class="notif-title">Verification Required</div>
              <div class="notif-desc">Manual ID check requested at Gate A.</div>
            </div>
            <div class="notif-time">${time}</div>
          </div>
        `;
        break;
      case 'clear':
        html = `
          <div class="notification-item success fade-in">
            <div class="notif-icon">✓</div>
            <div class="notif-content">
              <div class="notif-title">System Clear</div>
              <div class="notif-desc">All alerts resolved. Monitoring active.</div>
            </div>
            <div class="notif-time">${time}</div>
          </div>
        `;
        break;
    }

    if (html) {
      this.listElement.insertAdjacentHTML('afterbegin', html);
      // Keep list manageable
      if (this.listElement.children.length > 50) {
        this.listElement.lastElementChild.remove();
      }
    }
  }

  simulateDetection(type) {
    this.addNotification(type);
    
    // Randomly increment a vehicle counter
    const types = ['car', 'van', 'motor', 'truck'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    this.incrementCounter(randomType);
  }

  incrementCounter(type) {
    this.counters[type]++;
    this.recentIncrements[type]++;
    
    const countEl = document.getElementById(`count-${type}`);
    const incEl = document.getElementById(`inc-${type}`);
    
    // Update DOM
    countEl.textContent = this.counters[type];
    incEl.textContent = `↑ ${this.recentIncrements[type]} in last min`;
    
    // Animation
    incEl.style.animation = 'none';
    incEl.offsetHeight; /* trigger reflow */
    incEl.style.animation = 'pulse 0.5s ease-in-out';
  }

  randomUpdate() {
    // 30% chance to increment a counter naturally
    if (Math.random() > 0.7) {
      const types = ['car', 'van', 'motor', 'truck'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      this.incrementCounter(randomType);
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.notifications = new NotificationSystem();
});
