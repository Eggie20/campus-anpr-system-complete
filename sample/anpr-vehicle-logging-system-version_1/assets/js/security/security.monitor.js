/**
 * Security Monitor
 * CCTV monitoring and security guard functionality
 * Matches reference guard design
 */

const SecurityMonitor = {
  dutyStartTime: null,
  dutyTimerInterval: null,
  selectedCamera: 1,
  shiftDuration: 8 * 60 * 60 * 1000, // 8 hours in ms
  soundEnabled: true,

  /**
   * Initialize security monitor
   */
  init() {
    console.log('[SecurityMonitor] Initializing...');
    this.startDutyTimer();
    this.bindEvents();
    
    // Update time periodically
    setInterval(() => this.updateTimestamp(), 1000);
  },

  /**
   * Start duty timer (countdown from 8 hours)
   */
  startDutyTimer() {
    const stored = localStorage.getItem('duty_start_time');
    this.dutyStartTime = stored ? new Date(stored) : new Date();
    
    if (!stored) {
      localStorage.setItem('duty_start_time', this.dutyStartTime.toISOString());
    }
    
    this.dutyTimerInterval = setInterval(() => this.updateDutyTimer(), 1000);
    this.updateDutyTimer();
  },

  /**
   * Update duty timer display (countdown)
   */
  updateDutyTimer() {
    const now = new Date();
    const elapsed = now - this.dutyStartTime;
    const remaining = Math.max(0, this.shiftDuration - elapsed);
    
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    const timeStr = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
    
    const timerValue = document.getElementById('dutyTimerValue');
    const timerContainer = document.getElementById('dutyTimer');
    
    if (timerValue) timerValue.textContent = timeStr;
    
    // Warning at 30 minutes remaining
    if (hours === 0 && minutes <= 30 && minutes > 0) {
      timerContainer?.classList.add('warning');
      timerValue?.style.setProperty('color', '#ffc107');
    }
    
    // Critical at 0 - end of shift
    if (remaining === 0) {
      timerContainer?.classList.add('critical');
      timerValue?.style.setProperty('color', '#dc3545');
      this.showEndOfShiftModal();
    }
  },

  /**
   * Update the IP address timestamp display
   */
  updateTimestamp() {
    const ipEl = document.querySelector('.ip-address');
    if (ipEl) {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour12: false });
      ipEl.textContent = `IP: 192.168.1.101 | ${time}`;
    }
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Camera thumbnails
    document.querySelectorAll('.camera-thumbnail').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const cameraId = thumb.dataset.cam;
        this.selectCamera(cameraId, thumb);
      });
    });

    // Simulate detection dropdown
    const simulateBtn = document.getElementById('simulateBtn');
    const dropdown = document.getElementById('detectionDropdown');
    
    if (simulateBtn && dropdown) {
      simulateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        dropdown.classList.toggle('show');
      });
      
      dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          const type = item.dataset.type;
          if (type === 'clear') {
            this.clearDetection();
          } else {
            this.simulateDetection(type);
          }
          dropdown.classList.add('hidden');
          dropdown.classList.remove('show');
        });
      });
      
      // Close dropdown on outside click
      document.addEventListener('click', () => {
        dropdown.classList.add('hidden');
        dropdown.classList.remove('show');
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const current = document.documentElement.dataset.theme || 'default';
        const themes = ['default', 'light', 'dark'];
        const nextIndex = (themes.indexOf(current) + 1) % themes.length;
        const next = themes[nextIndex];
        document.documentElement.dataset.theme = next;
        localStorage.setItem('security_theme', next);
        themeToggle.textContent = next === 'light' ? '☀️' : '🌙';
      });
      
      // Load saved theme
      const savedTheme = localStorage.getItem('security_theme');
      if (savedTheme) {
        document.documentElement.dataset.theme = savedTheme;
        themeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';
      }
    }

    // Sound toggle
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        soundToggle.classList.toggle('muted', !this.soundEnabled);
      });
    }

    // Fullscreen
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
          this.logout();
        }
      });
    }

    // Modal buttons
    document.getElementById('confirmEndShift')?.addEventListener('click', () => {
      this.endShift();
    });

    document.getElementById('requestOvertimeBtn')?.addEventListener('click', () => {
      this.requestOvertime();
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('open');
        }
      });
    });


    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-backdrop')?.classList.remove('open');
      });
    });

    // Close preview popup on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.preview-popup') && !e.target.closest('.notification-item')) {
            document.querySelectorAll('.preview-popup').forEach(p => p.remove());
        }
    });
  },

  /**
   * Select a camera to view
   */
  selectCamera(cameraId, element) {
    this.selectedCamera = cameraId;
    
    // Update thumbnail active states
    document.querySelectorAll('.camera-thumbnail').forEach(thumb => {
      thumb.classList.remove('active');
    });
    element?.classList.add('active');
    
    // Camera data
    const cameras = {
      '1': { name: 'Left Side - Front', ip: '192.168.1.101', status: 'live' },
      '2': { name: 'Right Side - Front', ip: '192.168.1.102', status: 'live' },
      '3': { name: 'Left Side - Back', ip: '192.168.1.103', status: 'live' },
      '4': { name: 'Right Side - Back', ip: '192.168.1.104', status: 'offline' }
    };
    
    const camera = cameras[cameraId] || cameras['1'];
    
    // Update main display
    const titleEl = document.getElementById('mainCamTitle');
    const subtextEl = document.querySelector('.placeholder-subtext');
    
    if (titleEl) titleEl.textContent = camera.name;
    if (subtextEl) subtextEl.textContent = camera.name;
    
    console.log('[SecurityMonitor] Selected camera:', cameraId, camera.name);
  },

  /**
   * Simulate a vehicle detection
   */
  simulateDetection(type) {



    const detectionTypes = {
      'unregistered': { 
          title: 'Unregistered Vehicle', 
          desc: 'Plate ABC 1234 not found in database', 
          class: '', 
          plate: 'ABC 1234', 
          vehicle: 'CAR', 
          vehicleIcon: '🚗',
          color: 'Silver',
          direction: 'Entry', 
          notes: 'Vehicle license plate recognized but not found in the student or faculty database. Security verification required.'
      },
      'multiple': { 
          title: 'Multiple Vehicles', 
          desc: '3 vehicles detected in single frame', 
          class: 'warning', 
          plate: 'XYZ 9999', 
          vehicle: 'MULTIPLE', 
          vehicleIcon: '⚠️',
          color: 'Mixed',
          direction: 'N/A', 
          notes: 'System detected crowding at the gate entrance. Potential traffic bottleneck.'
      },
      'unauthorized': { 
          title: 'Unauthorized User', 
          desc: 'Driver ID mismatch for vehicle DEF 5678', 
          class: '', 
          plate: 'DEF 5678', 
          vehicle: 'CAR', 
          vehicleIcon: '🚗',
          color: 'Red',
          direction: 'Exit', 
          notes: 'RFID tag matches vehicle, but facial recognition does not match registered owner.'
      },
      'exception': { 
          title: 'Exception Granted', 
          desc: 'Visitor pass validated for XYZ 9012', 
          class: 'success', 
          plate: 'XYZ 9012', 
          vehicle: 'SUV', 
          vehicleIcon: '🚙',
          color: 'Black',
          direction: 'Entry', 
          notes: 'Valid One-Day Visitor Pass detected and verified. Access granted.'
      },
      'verification': { 
          title: 'Verification Required', 
          desc: 'Manual check needed for plate GHI 3456', 
          class: 'info', 
          plate: 'GHI 3456', 
          vehicle: 'TRUCK', 
          vehicleIcon: '🚚',
          color: 'Blue',
          direction: 'Entry', 
          notes: 'Plate obscured by mud or damage. Manual visual confirmation requested.'
      }
    };
    
    const detection = detectionTypes[type];
    if (!detection) return;
    
    // Add to notification list
    this.addNotification(detection);
    
    // Show popup (Stage 1)
    this.showPreview(detection, document.querySelector('.header-right')); // Mock target if triggered via button
    
    // Increment vehicle count
    this.incrementVehicleCount('car');
    
    console.log('[SecurityMonitor] Detection simulated:', type);
  },


  /**
   * Add notification to feed
   */
  addNotification(notification) {
    const feedList = document.getElementById('notificationList');
    if (!feedList) return;
    
    const item = document.createElement('div');
    item.className = `notification-item ${notification.class} fade-in`;
    item.innerHTML = `
      <div class="notif-icon">${notification.class === 'success' ? '✓' : '⚠'}</div>
      <div class="notif-content">
        <div class="notif-title">${notification.title}</div>
      <div class="notif-desc">${notification.desc}</div>
      </div>
      <div class="notif-time">Just now</div>
    `;
    

    // Add click event for details modal (Stage 1: Preview)
    item.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling
        this.showPreview(notification, item);
    });

    feedList.insertBefore(item, feedList.firstChild);
    feedList.scrollLeft = 0;
  },



  /**
   * Show Stage 1: Preview Popup (Enhanced)
   */
  showPreview(data, target) {
      // Remove existing previews
      document.querySelectorAll('.preview-popup').forEach(p => p.remove());

      const popup = document.createElement('div');
      popup.className = 'preview-popup';
      
      // Dynamic Accent Color
      // Default to Red (#dc3545) if class is empty, matching notification-item default
      const colorMap = { 'primary': 'var(--accent-color)', 'warning': '#ffc107', 'danger': '#dc3545', 'success': '#2e7d32', 'info': '#17a2b8' };
      const accentColor = data.class ? (colorMap[data.class] || 'var(--accent-color)') : '#dc3545';
      
      popup.style.borderLeftColor = accentColor;

      // Status Text derivation
      let statusText = "Details Available";
      if (data.class === 'success') statusText = "✓ Approved";
      else if (data.class === 'warning') statusText = "⚠️ Attention Needed";
      else if (data.class === 'info') statusText = "🔍 Manual Review";
      else if (data.class === '') statusText = "⚠️ Verification Required";

      const timestamp = new Date().toLocaleTimeString();

      popup.innerHTML = `
        <div class="preview-header">
            <div class="preview-title-row">
                <span class="preview-icon" style="color: ${accentColor}">${data.class === 'success' ? '✓' : '⚠️'}</span>
                <span class="preview-title" style="color: ${accentColor}">${data.title}</span>
            </div>
            <span class="preview-time">${timestamp}</span>
        </div>
        
        <div class="preview-body">
            <div class="preview-row">
                <span class="preview-label">Vehicle:</span>
                <span class="preview-val">${data.vehicleIcon} ${data.vehicle}</span>
            </div>
            <div class="preview-row">
                 <span class="preview-label">Plate:</span>
                 <span class="preview-plate">${data.plate || '---'}</span>
            </div>
            <div class="preview-status" style="color: ${accentColor}">
                ${statusText}
            </div>
        </div>

        <div class="preview-footer">
            <button class="btn btn-primary btn-xs btn-block" id="viewDetailsBtn" style="background-color: ${accentColor}; border-color: ${accentColor}">View Details</button>
        </div>
      `;

      document.body.appendChild(popup);

      // Positioning Logic (Near the target)
      let rect = target.getBoundingClientRect();
      // Fallback if target is weird
      if (rect.width === 0 && rect.height === 0) {
          rect = { top: window.innerHeight/2, left: window.innerWidth/2, width: 0, height: 0, bottom: window.innerHeight/2 };
      }

      const popupRect = popup.getBoundingClientRect();
      
      let top = rect.top - popupRect.height - 10;
      let left = rect.left + (rect.width / 2) - (popupRect.width / 2); // Center horizontally

      // Adjust if off screen
      if (top < 10) top = rect.bottom + 10;
      if (left < 10) left = 10;
      if (left + popupRect.width > window.innerWidth) left = window.innerWidth - popupRect.width - 10;

      popup.style.top = `${top + window.scrollY}px`;
      popup.style.left = `${left + window.scrollX}px`;

      // Event Listener for Stage 2
      const btn = popup.querySelector('#viewDetailsBtn');
      btn.addEventListener('click', (e) => {
          e.stopPropagation();
          popup.remove();
          this.showDetails(data);
      });
  },

  /**
   * Show Stage 2: Detailed detection modal
   */
  showDetails(data) {
      const modal = document.getElementById('detectionDetailModal');
      if (!modal) return;

      // Populate Data
      document.getElementById('modalTitle').textContent = data.title;
      document.getElementById('modalTimestamp').textContent = new Date().toLocaleTimeString();
      
      // Enhanced Vehicle Display with Icon
      const vehicleEl = document.getElementById('modalVehicle');
      vehicleEl.innerHTML = `<span class="vehicle-type-icon">${data.vehicleIcon || '🚗'}</span> ${data.vehicle} <span class="vehicle-color-badge">${data.color || ''}</span>`;
      
      document.getElementById('modalPlate').textContent = data.plate || '---';
      document.getElementById('modalCam').textContent = 'Gate A - Main Entrance'; // Mock
      document.getElementById('modalDirection').textContent = data.direction || 'Entry';
      document.getElementById('modalNotes').textContent = data.notes || 'No notes available.';
      
      // Update Icon
      const iconBadge = document.getElementById('modalIcon');
      iconBadge.textContent = data.class === 'success' ? '✓' : '⚠';
      iconBadge.style.color = data.class === 'success' ? '#4caf50' : '#ffc107';
      iconBadge.style.background = data.class === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 193, 7, 0.1)';

      // Open Modal
      modal.classList.add('open');
  },

  /**
   * Show popup notification (Toast)
   */
  showPopup(notification) {
    const container = document.getElementById('popupContainer');
    if (!container) return;
    
    const popup = document.createElement('div');
    popup.className = `detection-popup ${notification.class}`;
    popup.innerHTML = `
      <div style="font-size: 1.5rem;">${notification.class === 'success' ? '✅' : '⚠️'}</div>
      <div>
        <div style="font-weight: 600;">${notification.title}</div>
        <div style="font-size: 0.8rem; opacity: 0.8;">${notification.desc}</div>
      </div>
    `;
    
    // Click triggers detail view too
    popup.addEventListener('click', () => {
        this.showDetails(notification);
    });

    container.appendChild(popup);
    
    // Remove after 5 seconds
    setTimeout(() => {
      popup.style.animation = 'fadeOut 0.4s forwards';
      setTimeout(() => popup.remove(), 400);
    }, 5000);
  },

  /**
   * Clear detection overlay
   */
  clearDetection() {
    const overlay = document.getElementById('detectionOverlay');
    if (overlay) overlay.innerHTML = '';
    console.log('[SecurityMonitor] Detection cleared');
  },

  /**
   * Increment vehicle count
   */
  incrementVehicleCount(type) {
    const countEl = document.getElementById(`count-${type}`);
    if (countEl) {
      const current = parseInt(countEl.textContent) || 0;
      countEl.textContent = current + 1;
    }
    
    const incEl = document.getElementById(`inc-${type}`);
    if (incEl) {
      const match = incEl.textContent.match(/↑ (\d+)/);
      const current = match ? parseInt(match[1]) : 0;
      incEl.textContent = `↑ ${current + 1} in last min`;
    }
  },


  /**
   * Toggle fullscreen
   */
  toggleFullscreen() {
    // requesting fullscreen on document.documentElement ensures ALL body content (modals, popups) 
    // is included, not just the app-container
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
  },

  /**
   * Show end of shift modal
   */
  showEndOfShiftModal() {
    const modal = document.getElementById('endShiftModal');
    const modalTime = document.getElementById('modalDutyTime');
    
    if (modalTime) {
      const elapsed = new Date() - this.dutyStartTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      modalTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    modal?.classList.add('open');
  },

  /**
   * End shift
   */
  endShift() {
    clearInterval(this.dutyTimerInterval);
    localStorage.removeItem('duty_start_time');
    alert('Shift ended. Thank you for your service!');
    window.location.href = '../../index.html';
  },

  /**
   * Request overtime
   */
  requestOvertime() {
    const modal = document.getElementById('endShiftModal');
    modal?.classList.remove('open');
    
    // Extend shift by 2 hours
    this.shiftDuration += 2 * 60 * 60 * 1000;
    alert('Overtime approved. Extended by 2 hours.');
  },

  /**
   * Logout
   */
  logout() {
    clearInterval(this.dutyTimerInterval);
    localStorage.removeItem('duty_start_time');
    window.location.href = '../../index.html';
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SecurityMonitor.init();
});
