/* Duty Timer Logic */

class DutyTimer {
  constructor() {
    this.SHIFT_DURATION = 8 * 60 * 60 * 1000; // 8 hours in ms
    this.WARNING_THRESHOLD = 30 * 60 * 1000; // 30 minutes before end
    this.checkInterval = null;
    this.timerElement = null;
    
    this.init();
  }

  init() {
    // Only run on camera page
    if (!window.location.pathname.includes('camera.html')) return;

    this.timerElement = document.getElementById('dutyTimer');
    this.startTimer();
    
    // Check every minute
    this.checkInterval = setInterval(() => this.checkTime(), 60000);
    
    // Update display every second
    setInterval(() => this.updateDisplay(), 1000);
  }

  startTimer() {
    const session = Utils.session.get('currentUser');
    if (!session) {
      window.location.href = 'index.html';
      return;
    }

    // If no login time, set it now (for testing/direct access)
    if (!session.loginTime) {
      session.loginTime = new Date().toISOString();
      Utils.session.set('currentUser', session);
    }
  }

  getElapsedTime() {
    const session = Utils.session.get('currentUser');
    if (!session) return 0;
    
    const loginTime = new Date(session.loginTime).getTime();
    const now = new Date().getTime();
    return now - loginTime;
  }

  updateDisplay() {
    if (!this.timerElement) return;

    const elapsed = this.getElapsedTime();
    const remaining = Math.max(0, this.SHIFT_DURATION - elapsed);
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    this.timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    if (remaining < this.WARNING_THRESHOLD) {
      this.timerElement.classList.add('warning');
    }
  }

  checkTime() {
    const elapsed = this.getElapsedTime();
    const remaining = this.SHIFT_DURATION - elapsed;

    // Warning Modal (30 mins remaining)
    if (remaining <= this.WARNING_THRESHOLD && remaining > this.WARNING_THRESHOLD - 60000) {
      this.showWarningModal();
    }

    // End of Shift Modal
    if (remaining <= 0) {
      this.showEndShiftModal();
      clearInterval(this.checkInterval);
    }
  }

  showWarningModal() {
    // Create modal if not exists
    const modalHtml = `
      <div class="modal-overlay active" id="warningModal">
        <div class="modal-content">
          <h3 class="modal-title">⚠️ Shift Ending Soon</h3>
          <div class="modal-body">
            <p>Your shift will end in 30 minutes.</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" onclick="document.getElementById('warningModal').remove()">Acknowledge</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  showEndShiftModal() {
    const modalHtml = `
      <div class="modal-overlay active" id="endShiftModal" style="z-index: 2000;">
        <div class="modal-content">
          <h3 class="modal-title">🛑 Shift Ended</h3>
          <div class="modal-body">
            <p>Your 8-hour duty has ended. Please log out or request overtime.</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" onclick="window.dutyTimer.logout()">Logout Now</button>
            <button class="btn btn-secondary" onclick="window.dutyTimer.requestOvertime()">Request Overtime</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  logout() {
    Utils.session.remove('currentUser');
    window.location.href = 'index.html';
  }

  requestOvertime() {
    document.getElementById('endShiftModal').remove();
    
    const modalHtml = `
      <div class="modal-overlay active" id="overtimeModal">
        <div class="modal-content">
          <h3 class="modal-title">📝 Request Overtime</h3>
          <div class="modal-body">
            <div class="input-group">
              <label class="input-label">Reason for Overtime</label>
              <textarea class="form-input" rows="3" placeholder="e.g., Incident reporting pending..."></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" onclick="window.dutyTimer.submitOvertime()">Submit Request</button>
            <button class="btn btn-outline" onclick="window.dutyTimer.logout()">Cancel</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  submitOvertime() {
    // Simulate API call
    alert('Overtime request sent to supervisor.');
    document.getElementById('overtimeModal').remove();
    
    // Extend timer visually (optional logic)
    this.timerElement.classList.add('overtime');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.dutyTimer = new DutyTimer();
});
