/* Camera Switching Logic */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================
  // 1. THEME LOGIC
  // =========================================
  const themeToggleBtn = document.querySelector('.theme-toggle');
  const html = document.documentElement;
  const themes = ['light', 'dark', 'default'];
  let currentThemeIndex = 0;

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  currentThemeIndex = themes.indexOf(savedTheme);
  if (currentThemeIndex === -1) currentThemeIndex = 0;
  applyTheme(themes[currentThemeIndex]);

  themeToggleBtn.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });

  function applyTheme(theme) {
    html.removeAttribute('data-theme');
    if (theme !== 'default') {
      html.setAttribute('data-theme', theme);
    }
    
    // Update icon
    if (theme === 'dark') themeToggleBtn.textContent = '🌙';
    else if (theme === 'light') themeToggleBtn.textContent = '☀️';
    else themeToggleBtn.textContent = '🌗';
  }

  // =========================================
  // 2. SIMULATION & DROPDOWN
  // =========================================
  const simulateBtn = document.getElementById('simulateBtn');
  const dropdown = document.getElementById('detectionDropdown');
  const dropdownItems = document.querySelectorAll('.dropdown-item');

  simulateBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!simulateBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });

  dropdownItems.forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.type;
      handleSimulation(type);
      dropdown.classList.remove('show');
    });
  });

  // =========================================
  // 3. POPUPS & COUNTERS
  // =========================================
  // Create popup container if not exists
  let popupContainer = document.getElementById('popupContainer');
  if (!popupContainer) {
    popupContainer = document.createElement('div');
    popupContainer.id = 'popupContainer';
    popupContainer.className = 'popup-container';
    document.body.appendChild(popupContainer);
  }

  const counters = {
    car: 245,
    van: 87,
    motor: 156,
    truck: 34
  };

  function handleSimulation(type) {
    if (type === 'clear') {
      // Clear logic
      return;
    }

    // Map dropdown types to counters (simplified mapping)
    let counterType = 'car';
    if (type.includes('multiple')) counterType = 'van';
    if (type.includes('unauthorized')) counterType = 'motor';
    
    // Update Counter
    updateCounter(counterType);

    // Show Popup
    showPopup(type);

    // Add Notification
    addNotification(type);
  }

  function updateCounter(type) {
    if (counters[type] !== undefined) {
      counters[type]++;
      const el = document.getElementById(`count-${type}`);
      if (el) {
        el.textContent = counters[type];
        el.parentElement.parentElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
          el.parentElement.parentElement.style.transform = 'scale(1)';
        }, 200);
      }
    }
  }

  function showPopup(type) {
    const popup = document.createElement('div');
    popup.className = 'detection-popup';
    popup.innerHTML = `
      <span style="font-size:1.2rem">⚠️</span>
      <div>
        <div style="font-weight:600; font-size:0.9rem">${formatType(type)}</div>
        <div style="font-size:0.75rem; opacity:0.8">Gate A - Main Entrance</div>
      </div>
    `;

    popupContainer.appendChild(popup);

    // Auto remove
    setTimeout(() => {
      popup.classList.add('fade-out');
      popup.addEventListener('animationend', () => popup.remove());
    }, 4000);
  }

  function addNotification(type) {
    const list = document.getElementById('notificationList');
    const item = document.createElement('div');
    item.className = 'notification-item fade-in';
    item.innerHTML = `
      <div class="notif-icon">⚠️</div>
      <div class="notif-content">
        <div class="notif-title">${formatType(type)}</div>
        <div class="notif-desc">Detected at Gate A</div>
      </div>
      <div class="notif-time">Just now</div>
    `;
    list.insertBefore(item, list.firstChild);
    
    // Trigger animation
    item.offsetHeight; // Force reflow
    item.style.animation = 'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  }

  function formatType(type) {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // =========================================
  // 4. FULLSCREEN
  // =========================================
  const fullscreenBtn = document.querySelector('button[title="Fullscreen"]');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
  }

  // =========================================
  // 5. CAMERA THUMBNAILS
  // =========================================
  const thumbnails = document.querySelectorAll('.camera-thumbnail');
  const mainTitle = document.getElementById('mainCamTitle');
  const mainFeed = document.getElementById('mainCamFeed');
  
  // Camera data mapping
  const cameraData = {
    '1': { name: 'Gate A', ip: '192.168.1.101', image: 'assets/img/placeholders/cam1-large.jpg' },
    '2': { name: 'Gate B', ip: '192.168.1.102', image: 'assets/img/placeholders/cam2-large.jpg' },
    '3': { name: 'Gate C', ip: '192.168.1.103', image: 'assets/img/placeholders/cam3-large.jpg' },
    '4': { name: 'Gate D', ip: '192.168.1.104', image: 'assets/img/placeholders/cam4-large.jpg' }
  };
  
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbnails.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      
      const camId = thumb.dataset.cam;
      const camera = cameraData[camId];
      
      if (camera) {
        // Update title
        if (mainTitle) mainTitle.textContent = `${camera.name} - Main Entrance`;
        
        // Update IP address
        const ipElement = document.querySelector('.ip-address');
        if (ipElement) ipElement.textContent = `IP: ${camera.ip}`;
        
        // Update main feed image with smooth transition
        if (mainFeed) {
          mainFeed.style.opacity = '0.5';
          mainFeed.src = camera.image;
          mainFeed.onload = () => {
            mainFeed.style.opacity = '1';
          };
        }
      }
    });
  });
});
