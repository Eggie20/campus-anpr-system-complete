# CSS & JavaScript File Structure

This document describes the CSS and JavaScript file organization for the ANPR Vehicle Logging System.

---

## CSS Files

### Shared CSS (`assets/css/shared/`)

| File                    | Purpose                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `reset.css`             | Browser reset and base normalization                                |
| `tokens.css`            | Design tokens (colors, spacing, typography, shadows)                |
| `themes.css`            | Light/dark theme definitions (uses tokens)                          |
| `layout.flex.css`       | Flexbox utilities, grid helpers, app layout structure               |
| `components.base.css`   | Base UI components (sidebar, buttons, cards, forms, modals, tables) |
| `dashboard.widgets.css` | Dashboard-specific widgets (stat cards, activity feeds, charts)     |

### Page-Specific CSS

| File                            | Purpose                                            | Used By       |
| ------------------------------- | -------------------------------------------------- | ------------- |
| `landing.css`                   | Landing page styles (hero, portal cards, features) | `index.html`  |
| `admin/admin.dashboard.css`     | Admin dashboard overrides                          | Admin pages   |
| `faculty/faculty.dashboard.css` | Faculty dashboard overrides                        | Faculty pages |
| `student/student.dashboard.css` | Student dashboard overrides                        | Student pages |

---

## JavaScript Files

### Shared JS (`assets/js/shared/`)

| File                   | Purpose                                  | Key Functions                                                       |
| ---------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| `app.init.js`          | Main app bootstrap                       | `App.init()`, `initMobileMenu()`, `initModals()`, `initDropdowns()` |
| `app.state.js`         | Global state management                  | State storage and event dispatching                                 |
| `theme.toggle.js`      | Theme switching (dark/light)             | `ThemeToggle.init()`, `toggle()`                                    |
| `responsive.helper.js` | Breakpoint detection, resize utilities   | `ResponsiveHelper.init()`, `isMobile()`, `debounce()`               |
| `mock-api.js`          | Mock data for frontend development       | Users, vehicles, logs, notifications data                           |
| `dashboard.widgets.js` | Widget initialization (counters, charts) | Counter animations, data loading                                    |

---

## CSS Class Naming Conventions

### BEM-style Naming

```
.component-name                 /* Block */
.component-name__element        /* Element */
.component-name--modifier       /* Modifier */
```

### Key Component Classes

| Class                         | Description                        | File                    |
| ----------------------------- | ---------------------------------- | ----------------------- |
| `.app-layout`                 | Main page wrapper (sidebar + main) | `layout.flex.css`       |
| `.app-sidebar`                | Sidebar navigation                 | `components.base.css`   |
| `.app-main`                   | Main content area                  | `layout.flex.css`       |
| `.app-header`                 | Page header                        | `layout.flex.css`       |
| `.app-content`                | Scrollable content area            | `layout.flex.css`       |
| `.btn`, `.btn-primary`        | Buttons                            | `components.base.css`   |
| `.card`, `.card-header`       | Card containers                    | `components.base.css`   |
| `.form-input`, `.form-select` | Form elements                      | `components.base.css`   |
| `.modal-backdrop`, `.modal`   | Modal dialogs                      | `components.base.css`   |
| `.stat-widget`                | Statistics card                    | `dashboard.widgets.css` |
| `.dashboard-widget`           | Generic dashboard widget           | `dashboard.widgets.css` |
| `.data-table`                 | Styled data table                  | `dashboard.widgets.css` |
| `.notification-card`          | Notification item                  | `dashboard.widgets.css` |
| `.vehicle-card-enhanced`      | Vehicle card                       | `dashboard.widgets.css` |

---

## JavaScript Initialization Flow

```
DOMContentLoaded
    │
    ├── App.init() (app.init.js)
    │   ├── initTheme()
    │   ├── initSidebar()
    │   ├── initMobileMenu()
    │   ├── initDropdowns()
    │   ├── initModals()
    │   └── initNotifications()
    │
    ├── ResponsiveHelper.init() (responsive.helper.js)
    │   └── handleResize()
    │
    └── ThemeToggle.init() (theme.toggle.js)
        └── loadSavedTheme()
```

---

## Portal Page Links

| Portal   | Entry Point                  | Dashboard                             |
| -------- | ---------------------------- | ------------------------------------- |
| Admin    | `assets/pages/admin.html`    | `assets/pages/admin/dashboard.html`   |
| Faculty  | `assets/pages/faculty.html`  | `assets/pages/faculty/dashboard.html` |
| Student  | `assets/pages/student.html`  | `assets/pages/student/dashboard.html` |
| Security | `assets/pages/security.html` | N/A                                   |
