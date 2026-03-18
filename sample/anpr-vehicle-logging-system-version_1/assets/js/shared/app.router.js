/**
 * App Router
 * Simple client-side routing for single-page navigation
 */

const AppRouter = {
  routes: {},
  currentRoute: null,

  /**
   * Initialize router
   */
  init() {
    // Handle popstate (back/forward buttons)
    window.addEventListener('popstate', () => this.handleRoute());
    
    // Handle link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        this.navigate(link.dataset.route);
      }
    });
    
    // Handle initial route
    this.handleRoute();
  },

  /**
   * Register a route handler
   * @param {string} path - Route path
   * @param {Function} handler - Route handler function
   */
  register(path, handler) {
    this.routes[path] = handler;
  },

  /**
   * Navigate to a route
   * @param {string} path - Route path
   * @param {Object} state - State to pass
   */
  navigate(path, state = {}) {
    history.pushState(state, '', path);
    this.handleRoute();
  },

  /**
   * Replace current route
   * @param {string} path - Route path
   * @param {Object} state - State to pass
   */
  replace(path, state = {}) {
    history.replaceState(state, '', path);
    this.handleRoute();
  },

  /**
   * Handle current route
   */
  handleRoute() {
    const path = window.location.pathname;
    const hash = window.location.hash.slice(1);
    const route = hash || this.getRouteFromPath(path);
    
    this.currentRoute = route;
    
    // Fire route change event
    document.dispatchEvent(new CustomEvent('route:change', { 
      detail: { 
        route, 
        path, 
        hash,
        params: this.getQueryParams()
      } 
    }));
    
    // Call route handler if exists
    if (this.routes[route]) {
      this.routes[route](this.getQueryParams());
    } else if (this.routes['*']) {
      // Fallback/404 handler
      this.routes['*'](route);
    }
  },

  /**
   * Get route from path
   * @param {string} path - URL path
   * @returns {string}
   */
  getRouteFromPath(path) {
    // Extract page name from path
    const match = path.match(/\/([^\/]+)\.html?$/);
    return match ? match[1] : 'home';
  },

  /**
   * Get query parameters
   * @returns {Object}
   */
  getQueryParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    return params;
  },

  /**
   * Get current route
   * @returns {string}
   */
  getCurrentRoute() {
    return this.currentRoute;
  },

  /**
   * Check if current route matches
   * @param {string} route - Route to check
   * @returns {boolean}
   */
  isRoute(route) {
    return this.currentRoute === route;
  },

  /**
   * Go back in history
   */
  back() {
    history.back();
  },

  /**
   * Go forward in history
   */
  forward() {
    history.forward();
  }
};
