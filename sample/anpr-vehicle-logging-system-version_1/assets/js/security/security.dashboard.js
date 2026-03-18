/**
 * Security Dashboard
 * CCTV monitoring and security guard functionality
 */

const SecurityDashboard = {
  dutyStartTime: null,
  dutyTimerInterval: null,
  selectedCamera: 1,

  /**
   * Initialize security dashboard
   */
  init() {
    console.log('[SecurityDashboard] Initializing...');
    this.startDutyTimer();
    this.updateTimestamp();
    this.bindEvents();
    this.loadStats();
    
    // Update timestamp every second
    setInterval(() => this.updateTimestamp(), 1000);
  },

  /**
   * Start duty timer
   */
  startDutyTimer() {
    // Get start time from storage or use current time
    const stored = localStorage.getItem('duty_start_time');
    this.dutyStartTime = stored ? new Date(stored) : new Date();
    
    if (!stored) {
      localStorage.setItem('duty_start_time', this.dutyStartTime.toISOString());
    }
    
    // Update timer every second
    this.dutyTimerInterval = setInterval(() => this.updateDutyTimer(), 1000);
    this.updateDutyTimer();
  },

  /**
   * Update duty timer display
   */
  updateDutyTimer() {
    const now = new Date();
    const diff = now - this.dutyStartTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    const timeStr = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
    
    const timerValue = document.getElementById('dutyTime');
    const timerContainer = document.getElementById('dutyTimer');
    
    if (timerValue) timerValue.textContent = timeStr;
    
    // Warning at 7.5 hours
    if (hours >= 7 && minutes >= 30) {
      timerContainer?.classList.add('warning');
      timerValue?.classList.add('timer-warning');
    }
    
    // Critical at 8 hours
    if (hours >= 8) {
      timerContainer?.classList.remove('warning');
      timerContainer?.classList.add('critical');
      timerValue?.classList.remove('timer-warning');
      timerValue?.classList.add('timer-critical');
      
      // Show end of shift modal
      this.showEndOfShiftModal();
    }
  },

  /**
   * Update camera timestamp
   */
  updateTimestamp() {
    const el = document.getElementById('cameraTimestamp');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleString('en-PH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
  },

  /**
   * Load dashboard stats
   */
  async loadStats() {
    try {
      const response = await MockAPI.getDashboardStats('security');
      const stats = response.data;
      
      document.getElementById('onlineCameras').textContent = stats.onlineCameras || 5;
      document.getElementById('totalCameras').textContent = stats.totalCameras || 6;
      document.getElementById('todayEntries').textContent = stats.todayEntries || 24;
      document.getElementById('todayExits').textContent = stats.todayExits || 21;
      
    } catch (error) {
      console.error('[SecurityDashboard] Failed to load stats:', error);
    }
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Camera thumbnails
    document.querySelectorAll('.camera-thumbnail').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const cameraId = thumb.dataset.cameraId;
        this.selectCamera(cameraId);
      });
    });

    // Fullscreen button
    document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    document.getElementById('cameraFullscreen')?.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Simulate detection button
    document.getElementById('simulateBtn')?.addEventListener('click', () => {
      this.simulateDetection();
    });

    // End shift button
    document.getElementById('endShiftBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showEndOfShiftModal();
    });

    // Modal buttons
    document.getElementById('confirmEndShift')?.addEventListener('click', () => {
      this.endShift();
    });

    document.getElementById('requestOvertimeBtn')?.addEventListener('click', () => {
      this.requestOvertime();
    });

    // Alert button
    document.getElementById('alertBtn')?.addEventListener('click', () => {
      this.triggerAlert();
    });
  },

  /**
   * Select a camera to view
   */
  selectCamera(cameraId) {
    this.selectedCamera = cameraId;
    
    // Update thumbnail active states
    document.querySelectorAll('.camera-thumbnail').forEach(thumb => {
      thumb.classList.toggle('active', thumb.dataset.cameraId === cameraId);
    });
    
    // Update camera name
    const cameras = {
      '1': 'Main Gate - Entry',
      '2': 'Main Gate - Exit',
      '3': 'Parking Lot A',
      '4': 'Parking Lot B'
    };
    
    const nameEl = document.getElementById('activeCameraName');
    if (nameEl) nameEl.textContent = cameras[cameraId] || 'Unknown Camera';
    
    // Add switching animation
    const mainCamera = document.getElementById('mainCamera');
    mainCamera?.classList.add('camera-switching');
    setTimeout(() => mainCamera?.classList.remove('camera-switching'), 300);
    
    console.log('[SecurityDashboard] Selected camera:', cameraId);
  },

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    const dashboard = document.getElementById('securityDashboard');
    dashboard?.classList.toggle('fullscreen');
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      dashboard?.requestFullscreen?.();
    }
  },

  /**
   * Simulate vehicle detection
   */
  async simulateDetection() {
    const plates = ['ABC 1234', 'XYZ 5678', 'DEF 9012', 'UNK 0000', 'JKL 7890'];
    const randomPlate = plates[Math.floor(Math.random() * plates.length)];
    
    try {
      const response = await MockAPI.logVehicleDetection(randomPlate, this.selectedCamera);
      const log = response.data;
      
      // Add notification to feed
      this.addNotificationToFeed({
        title: log.status === 'authorized' ? '✅ Vehicle Authorized' : '⚠️ Unregistered Vehicle',
        message: `Plate ${log.plateNumber} detected`,
        severity: log.status === 'authorized' ? 'low' : 'high',
        time: 'Just now'
      });
      
      // Update vehicle counters
      this.incrementVehicleCount('car');
      
      // Show toast
      if (typeof App !== 'undefined' && App.toast) {
        App.toast(
          `Vehicle ${log.plateNumber} detected - ${log.status}`,
          log.status === 'authorized' ? 'success' : 'warning'
        );
      }
      
    } catch (error) {
      console.error('[SecurityDashboard] Detection failed:', error);
    }
  },

  /**
   * Add notification to feed
   */
  addNotificationToFeed(notification) {
    const feedList = document.getElementById('feedList');
    if (!feedList) return;
    
    const item = document.createElement('article');
    item.className = `feed-item ${notification.severity} notification-item`;
    item.innerHTML = `
      <header class="feed-item-header">
        <span class="feed-item-title">${notification.title}</span>
        <time class="feed-item-time">${notification.time}</time>
      </header>
      <p class="feed-item-message">${notification.message}</p>
    `;
    
    feedList.insertBefore(item, feedList.firstChild);
    
    // Update count
    const countEl = document.getElementById('alertCount');
    if (countEl) {
      countEl.textContent = parseInt(countEl.textContent) + 1;
    }
  },

  /**
   * Increment vehicle count
   */
  incrementVehicleCount(type) {
    const countId = type + 'Count';
    const el = document.getElementById(countId);
    if (el) {
      const current = parseInt(el.textContent);
      el.textContent = current + 1;
      el.classList.add('count-animate');
      setTimeout(() => el.classList.remove('count-animate'), 300);
    }
  },

  /**
   * Show end of shift modal
   */
  showEndOfShiftModal() {
    const modal = document.getElementById('endShiftModal');
    const modalTime = document.getElementById('modalDutyTime');
    
    if (modalTime) {
      modalTime.textContent = document.getElementById('dutyTime')?.textContent || '08:00:00';
    }
    
    modal?.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  /**
   * End shift
   */
  endShift() {
    clearInterval(this.dutyTimerInterval);
    localStorage.removeItem('duty_start_time');
    
    if (typeof App !== 'undefined' && App.toast) {
      App.toast('Shift ended successfully. Have a good rest!', 'success');
    }
    
    // Redirect to home after 2 seconds
    setTimeout(() => {
      window.location.href = '../../index.html';
    }, 2000);
  },

  /**
   * Request overtime
   */
  requestOvertime() {
    const modal = document.getElementById('endShiftModal');
    modal?.classList.remove('open');
    document.body.style.overflow = '';
    
    if (typeof App !== 'undefined' && App.toast) {
      App.toast('Overtime request submitted. Continue monitoring.', 'info');
    }
  },

  /**
   * Trigger emergency alert
   */
  triggerAlert() {
    this.addNotificationToFeed({
      title: '🚨 Alert Triggered',
      message: 'Manual alert activated by security guard',
      severity: 'high',
      time: 'Just now'
    });
    
    if (typeof App !== 'undefined' && App.toast) {
      App.toast('Emergency alert sent to admin!', 'warning');
    }
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SecurityDashboard.init();
});
