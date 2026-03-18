/**
 * Dashboard Widgets JavaScript
 * Handles widget initialization, animated counters, and mock data display
 */

const DashboardWidgets = {
  /**
   * Initialize all dashboard widgets
   */
  init() {
    this.initAnimatedCounters();
    this.initMiniCharts();
    this.initActivityFeed();
  },

  /**
   * Animated counter effect for stat widgets
   */
  initAnimatedCounters() {
    const counters = document.querySelectorAll("[data-count]");

    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-count"), 10);
      const duration = 1000; // 1 second
      const start = 0;
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);

        counter.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toLocaleString();
        }
      };

      // Start animation when element is visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(updateCounter);
            observer.unobserve(entry.target);
          }
        });
      });

      observer.observe(counter);
    });
  },

  /**
   * Initialize CSS-based mini bar charts
   */
  initMiniCharts() {
    const charts = document.querySelectorAll(".mini-chart");

    charts.forEach((chart) => {
      const bars = chart.querySelectorAll(".mini-chart__bar");
      const values = Array.from(bars).map((bar) =>
        parseInt(bar.getAttribute("data-value"), 10)
      );
      const maxValue = Math.max(...values);

      bars.forEach((bar) => {
        const value = parseInt(bar.getAttribute("data-value"), 10);
        const height = (value / maxValue) * 100;
        bar.style.height = `${Math.max(height, 5)}%`;
      });
    });
  },

  /**
   * Initialize real-time activity feed
   */
  initActivityFeed() {
    const feeds = document.querySelectorAll("[data-activity-feed]");

    feeds.forEach((feed) => {
      // Add fade-in animation to items
      const items = feed.querySelectorAll(".activity-item");
      items.forEach((item, index) => {
        item.style.animationDelay = `${index * 50}ms`;
        item.classList.add("fade-in-up");
      });
    });
  },

  /**
   * Format relative time
   */
  formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  },

  /**
   * Render a mini table with data
   */
  renderMiniTable(container, data, options = {}) {
    const {
      avatarKey = "initials",
      primaryKey = "name",
      secondaryKey = "email",
      metaKey = "date",
    } = options;

    const html = data
      .map(
        (item) => `
      <div class="mini-table__row">
        <div class="mini-table__avatar" style="background: ${
          item.color || "var(--color-primary)"
        }">${item[avatarKey]}</div>
        <div class="mini-table__content">
          <div class="mini-table__primary">${item[primaryKey]}</div>
          <div class="mini-table__secondary">${item[secondaryKey]}</div>
        </div>
        ${
          item[metaKey]
            ? `<div class="mini-table__meta"><span class="badge ${
                item.badgeClass || "badge-primary"
              }">${item[metaKey]}</span></div>`
            : ""
        }
      </div>
    `
      )
      .join("");

    container.innerHTML = html;
  },

  /**
   * Render activity feed with data
   */
  renderActivityFeed(container, activities) {
    const iconMap = {
      entry: "activity-item__icon--entry",
      exit: "activity-item__icon--exit",
      alert: "activity-item__icon--alert",
      system: "activity-item__icon--system",
    };

    const emojiMap = {
      entry: "📥",
      exit: "📤",
      alert: "⚠️",
      system: "⚙️",
    };

    const html = activities
      .map(
        (activity) => `
      <div class="activity-item fade-in-up">
        <div class="activity-item__icon ${
          iconMap[activity.type] || "activity-item__icon--system"
        }">
          ${emojiMap[activity.type] || "📌"}
        </div>
        <div class="activity-item__content">
          <div class="activity-item__text">${activity.message}</div>
          <div class="activity-item__time">${this.formatRelativeTime(
            activity.timestamp
          )}</div>
        </div>
      </div>
    `
      )
      .join("");

    container.innerHTML = html;
  },

  /**
   * Render camera grid
   */
  renderCameraGrid(container, cameras) {
    const statusMap = {
      online: "camera-tile__status--online",
      offline: "camera-tile__status--offline",
      recording: "camera-tile__status--recording",
    };

    const html = cameras
      .map(
        (camera) => `
      <div class="camera-tile" data-camera-id="${camera.id}">
        <div class="camera-tile__placeholder">📹</div>
        <div class="camera-tile__status ${
          statusMap[camera.status] || "camera-tile__status--offline"
        }"></div>
        <div class="camera-tile__label">${camera.name}</div>
      </div>
    `
      )
      .join("");

    container.innerHTML = html;
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  DashboardWidgets.init();
});

// Export for use in other modules
if (typeof window !== "undefined") {
  window.DashboardWidgets = DashboardWidgets;
}
