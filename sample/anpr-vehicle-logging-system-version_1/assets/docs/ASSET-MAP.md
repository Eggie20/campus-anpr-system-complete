# Asset Map

This document provides a complete overview of all assets in the Campus Security & CCTV Monitoring System.

---

## Directory Structure

```
/assets
├── /css
│   ├── /shared          → Common styles used across all roles
│   ├── /student         → Student-specific styles
│   ├── /faculty         → Faculty-specific styles
│   ├── /admin           → Admin-specific styles
│   └── /security        → Security-specific styles
│
├── /js
│   ├── /shared          → Core JavaScript modules
│   ├── /student         → Student dashboard logic
│   ├── /faculty         → Faculty dashboard logic
│   ├── /admin           → Admin CRUD operations
│   └── /security        → CCTV monitoring logic
│
├── /animations          → CSS keyframe animations
├── /pages               → Role-specific HTML dashboards
└── /components          → Reusable HTML components
```

---

## CSS Files

| File                     | Location  | Purpose                                     |
| ------------------------ | --------- | ------------------------------------------- |
| `reset.css`              | /shared   | Cross-browser CSS reset                     |
| `tokens.css`             | /shared   | Design tokens (colors, spacing, typography) |
| `themes.css`             | /shared   | Light/Dark mode variables                   |
| `layout.flex.css`        | /shared   | Flexbox/Grid utilities                      |
| `components.base.css`    | /shared   | Buttons, cards, forms, tables, modals       |
| `student.dashboard.css`  | /student  | Student-specific layouts                    |
| `security.dashboard.css` | /security | CCTV grid, duty timer                       |
| `admin.dashboard.css`    | /admin    | CRUD tables, stats                          |

---

## JavaScript Modules

| Module                 | Location | Exports                                       |
| ---------------------- | -------- | --------------------------------------------- |
| `app.init.js`          | /shared  | `App` - Bootstrap, sidebar, modals, toasts    |
| `app.state.js`         | /shared  | `AppState` - localStorage state management    |
| `theme.toggle.js`      | /shared  | `ThemeToggle` - Dark/light mode               |
| `responsive.helper.js` | /shared  | `ResponsiveHelper` - Breakpoints, mobile menu |
| `mock-api.js`          | /shared  | `MockAPI` - Simulated backend                 |
| `app.router.js`        | /shared  | `AppRouter` - Client-side routing             |

---

## HTML Pages

| Page            | URL                           | Role                           |
| --------------- | ----------------------------- | ------------------------------ |
| `index.html`    | `/`                           | Landing page with portal links |
| `student.html`  | `/assets/pages/student.html`  | Student dashboard              |
| `faculty.html`  | `/assets/pages/faculty.html`  | Faculty dashboard              |
| `admin.html`    | `/assets/pages/admin.html`    | Admin panel                    |
| `security.html` | `/assets/pages/security.html` | Security monitoring            |
