# 🧠 ULTIMATE MASTER PROMPT: Complete Campus Security Frontend System

> **ROLE:**
> You are a **Principal Frontend Architect & UI/UX Designer** tasked to build a **full frontend-first Campus Security & CCTV Monitoring System**.
> Your priority is **clarity, modularity, maintainability, role separation, and future-admin friendliness**.

---

## 🎯 OBJECTIVE

Build a **frontend-first web system** that includes:

1. Dashboards for:
   - Student
   - Faculty
   - Admin
   - Security Personnel
2. Role-based assets:
   - CSS
   - JS
   - Images
   - Components
3. CRUD system (Admin side)
4. Header, Sidebar, Footer for all roles
5. Notifications system
6. CCTV camera grid for Security dashboard
7. Responsive design (mobile → desktop → 24-inch monitor)
8. **Complete Dark/Light mode toggle with persistent theme**
9. Documentation for future admins (Markdown)

---

## 🧩 ARCHITECTURE RULES

1. **Role-scoped assets**: Each role has its own CSS, JS, Images, Components folder.
2. **Shared assets**: General CSS, JS, images, and components live in `/shared`.
3. **File size rules**:
   - Most files ≤150 lines
   - Complex dashboards ≤300–500 lines
4. **One responsibility per file**: No mixing layout + logic + state
5. **Feature modularity**: CRUD, notifications, CCTV, analytics, vehicle logs are isolated modules
6. **Responsive & Theme-ready**: Flexbox + CSS Grid, CSS variables for dark/light mode
7. **Searchable & maintainable**: Clear naming for future admins
8. **Theme persistence**: localStorage implementation for theme preferences across all pages

---

## 📁 FULL FILE STRUCTURE

```
/assets
├── /css
│   ├── /shared
│   │   ├── reset.css
│   │   ├── tokens.css
│   │   ├── tokens.light.css          # NEW: Light mode color tokens
│   │   ├── tokens.dark.css           # NEW: Dark mode color tokens
│   │   ├── layout.flex.css
│   │   ├── components.base.css
│   │   ├── themes.css                # NEW: Enhanced theme system
│   │   └── theme.transitions.css     # NEW: Smooth theme transitions
│   │
│   ├── /student
│   │   ├── student.dashboard.css
│   │   ├── student.dashboard.light.css   # NEW: Light mode overrides
│   │   ├── student.notifications.css
│   │   └── student.responsive.css
│   │
│   ├── /faculty
│   │   ├── faculty.dashboard.css
│   │   ├── faculty.dashboard.light.css   # NEW: Light mode overrides
│   │   ├── faculty.notifications.css
│   │   └── faculty.responsive.css
│   │
│   ├── /admin
│   │   ├── admin.dashboard.css
│   │   ├── admin.dashboard.light.css     # NEW: Light mode overrides
│   │   ├── admin.analytics.css
│   │   ├── admin.notifications.css
│   │   ├── admin.crud.css
│   │   └── admin.responsive.css
│   │
│   └── /security
│       ├── security.dashboard.css
│       ├── security.dashboard.light.css  # NEW: Light mode overrides
│       ├── security.cctv.css
│       ├── security.animations.css
│       └── security.responsive.css
│
├── /js
│   ├── /shared
│   │   ├── app.init.js
│   │   ├── app.router.js
│   │   ├── app.state.js
│   │   ├── theme.toggle.js           # ENHANCED: Complete theme system
│   │   ├── theme.manager.js          # NEW: Theme state management
│   │   └── responsive.helper.js
│   │
│   ├── /student
│   │   ├── student.dashboard.js
│   │   ├── student.header.js
│   │   ├── student.sidebar.js
│   │   ├── student.footer.js
│   │   ├── student.theme.js          # NEW: Role-specific theme handler
│   │   └── student.notifications.js
│   │
│   ├── /faculty
│   │   ├── faculty.dashboard.js
│   │   ├── faculty.header.js
│   │   ├── faculty.sidebar.js
│   │   ├── faculty.footer.js
│   │   ├── faculty.theme.js          # NEW: Role-specific theme handler
│   │   └── faculty.notifications.js
│   │
│   ├── /admin
│   │   ├── admin.dashboard.js
│   │   ├── admin.analytics.js
│   │   ├── admin.header.js
│   │   ├── admin.sidebar.js
│   │   ├── admin.footer.js
│   │   ├── admin.notifications.js
│   │   ├── admin.theme.js            # NEW: Role-specific theme handler
│   │   ├── admin.state.js
│   │   ├── admin.users.crud.js
│   │   ├── admin.vehicles.crud.js
│   │   ├── admin.cameras.crud.js
│   │   └── admin.security.crud.js
│   │
│   └── /security
│       ├── security.dashboard.js
│       ├── security.header.js
│       ├── security.sidebar.js
│       ├── security.footer.js
│       ├── security.cctv.js
│       ├── security.theme.js         # NEW: Role-specific theme handler
│       ├── security.notifications.js
│       └── security.state.js
│
├── /images
│   ├── /shared
│   │   ├── /icons
│   │   │   ├── sun-icon.svg          # NEW: Light mode icon
│   │   │   └── moon-icon.svg         # NEW: Dark mode icon
│   ├── /student
│   ├── /faculty
│   ├── /admin
│   └── /security
│
├── /components
│   ├── /shared
│   │   ├── header/
│   │   ├── sidebar/
│   │   ├── footer/
│   │   ├── notification/
│   │   └── theme-toggle/            # NEW: Theme toggle component
│   │
│   ├── /student
│   │   └── vehicle-log/
│   │
│   ├── /faculty
│   │   └── vehicle-log/
│   │
│   ├── /admin
│   │   ├── analytics/
│   │   └── user-management/
│   │
│   └── /security
│       ├── cctv-grid/
│       └── capture-panel/
│
├── /animations
│   ├── shared.animations.css
│   ├── theme.transitions.css        # NEW: Theme switch animations
│   └── security.cctv.animations.css
│
├── /pages
│   ├── student.html
│   ├── faculty.html
│   ├── admin.html
│   └── security.html
│
├── /docs
│   ├── ASSET-MAP.md
│   ├── COMPONENT-REFERENCE.md
│   ├── ROLE-SEPARATION.md
│   ├── THEME-SYSTEM.md              # NEW: Theme implementation guide
│   ├── HANDOVER-GUIDE.md
│   └── CHANGELOG.md
│
└── index.html
```

---

## 🔹 FUNCTIONAL REQUIREMENTS

### Dashboards

- **Student/Faculty**: Header, Sidebar, Footer, Vehicle Logs, Notifications, Quick Stats
- **Admin**: Dashboard, CRUD (Users, Vehicles, Cameras, Security), Analytics, Notifications
- **Security**: Dashboard, CCTV Grid, Vehicle Capture, Notifications

### CRUD

- Modular engine for Admin (`crud.engine.js`)
- Feature-specific configs for each entity (`users.crud.js`, etc.)
- Mock API for frontend-only execution

### Notifications

- Role-aware, decoupled from dashboards
- Toast + panel views
- Modular JS + CSS per role

### CCTV

- Security dashboard uses CSS Grid for camera layout
- Fullscreen camera focus capability
- Optimized for 24-inch monitor

### Responsive & Theme

- Mobile → Desktop → 24-inch monitor
- Flexbox for layout, Grid for camera grids
- Dark/Light mode toggle via CSS variables + JS

---

## 🌓 DARK/LIGHT MODE REQUIREMENTS (CRITICAL)

### **Theme System Architecture**

#### **1. CSS Implementation**

**Color Token System (`tokens.dark.css` & `tokens.light.css`):**

```css
/* Dark Mode Tokens (Default) */
:root {
  /* Backgrounds */
  --bg-primary: #0f1729;
  --bg-secondary: #1a2332;
  --bg-tertiary: #2d3748;
  --bg-card: #1a2332;
  --bg-hover: #2d3748;

  /* Text Colors */
  --text-primary: #ffffff;
  --text-secondary: #e5e7eb;
  --text-tertiary: #9ca3af;
  --text-muted: #6b7280;

  /* Border Colors */
  --border-primary: #2d3748;
  --border-secondary: rgba(255, 255, 255, 0.1);
  --border-focus: rgba(34, 211, 238, 0.5);

  /* Accent Colors (Consistent across themes) */
  --accent-cyan: #22d3ee;
  --accent-green: #10b981;
  --accent-orange: #f97316;
  --accent-purple: #a855f7;
  --accent-red: #ef4444;
  --accent-blue: #3b82f6;

  /* Status Colors */
  --status-success: #10b981;
  --status-warning: #f59e0b;
  --status-error: #ef4444;
  --status-info: #3b82f6;

  /* Shadow */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}

/* Light Mode Tokens */
[data-theme="light"] {
  /* Backgrounds */
  --bg-primary: #f3f4f6;
  --bg-secondary: #ffffff;
  --bg-tertiary: #e5e7eb;
  --bg-card: #ffffff;
  --bg-hover: #f9fafb;

  /* Text Colors */
  --text-primary: #111827;
  --text-secondary: #1f2937;
  --text-tertiary: #6b7280;
  --text-muted: #9ca3af;

  /* Border Colors */
  --border-primary: #e5e7eb;
  --border-secondary: #d1d5db;
  --border-focus: rgba(59, 130, 246, 0.5);

  /* Shadow */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
}
```

**Smooth Transitions (`theme.transitions.css`):**

```css
/* Apply smooth transitions to all theme-affected elements */
* {
  transition: background-color 0.3s ease, color 0.3s ease,
    border-color 0.3s ease, box-shadow 0.3s ease;
}
```

#### **2. JavaScript Implementation**

**Theme Manager (`theme.manager.js`):**

```javascript
class ThemeManager {
  constructor() {
    this.STORAGE_KEY = "campusSecure_theme";
    this.THEME_ATTRIBUTE = "data-theme";
    this.init();
  }

  init() {
    const savedTheme = this.getSavedTheme();
    const systemTheme = this.getSystemTheme();
    const theme = savedTheme || systemTheme;
    this.applyTheme(theme);
    this.watchSystemTheme();
  }

  getSavedTheme() {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  applyTheme(theme) {
    document.documentElement.setAttribute(this.THEME_ATTRIBUTE, theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateToggleButton(theme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute(this.THEME_ATTRIBUTE);
    const newTheme = current === "dark" ? "light" : "dark";
    this.applyTheme(newTheme);
    return newTheme;
  }

  updateToggleButton(theme) {
    const toggleBtn = document.querySelector("[data-theme-toggle]");
    if (toggleBtn) {
      const icon = toggleBtn.querySelector("svg, i, img");
      if (icon) {
        // Update icon based on theme (sun for light, moon for dark)
        icon.setAttribute("data-theme-icon", theme);
      }
    }
  }

  watchSystemTheme() {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!this.getSavedTheme()) {
          this.applyTheme(e.matches ? "dark" : "light");
        }
      });
  }
}

// Initialize globally
window.themeManager = new ThemeManager();
```

**Theme Toggle Component (`theme.toggle.js`):**

```javascript
function initThemeToggle() {
  const toggleBtn = document.querySelector("[data-theme-toggle]");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const newTheme = window.themeManager.toggleTheme();

      // Optional: Add ripple effect or animation
      toggleBtn.classList.add("theme-toggle-active");
      setTimeout(() => {
        toggleBtn.classList.remove("theme-toggle-active");
      }, 300);
    });
  }
}

// Auto-initialize
document.addEventListener("DOMContentLoaded", initThemeToggle);
```

#### **3. Components Affected by Theme**

**All the following components MUST respond to theme changes:**

1. **Header/Top Navigation:**

   - Background color
   - Logo (may need light/dark variants)
   - Search bar background and text
   - User profile section
   - Notification icons
   - Theme toggle button itself

2. **Sidebar/Navigation Menu:**

   - Background color
   - Menu items text
   - Active menu item highlight
   - Icons
   - Dividers
   - Hover states

3. **Main Content Area:**

   - Page background
   - All card backgrounds
   - Section backgrounds
   - Text color

4. **Cards/Panels:**

   - Card backgrounds
   - Card borders
   - Card shadows
   - Text within cards
   - Card hover states

5. **Buttons:**

   - Primary buttons
   - Secondary buttons
   - Outline buttons
   - Icon buttons
   - Disabled states

6. **Status Badges:**

   - "LIVE" indicators
   - "Active" badges
   - "Entry"/"Exit" badges
   - Status colors (adjust opacity for light mode if needed)

7. **Data Visualization:**

   - Stats cards
   - Charts/graphs (if any)
   - Progress bars
   - Metrics displays

8. **Form Elements:**

   - Input fields
   - Search bars
   - Dropdowns
   - Checkboxes/Radio buttons

9. **Tables:**

   - Table headers
   - Table rows
   - Alternating row colors
   - Border colors

10. **Modals/Popups:**

    - Modal backgrounds
    - Modal overlays
    - Modal content

11. **Notifications:**

    - Notification cards
    - Toast notifications
    - Alert banners

12. **CCTV Grid (Security Dashboard):**

    - Camera card backgrounds
    - "LIVE" indicators
    - Camera labels
    - Grid borders

13. **Footer:**
    - Background color
    - Text color
    - Links

#### **4. Theme Toggle Button Placement**

Place the theme toggle button in the **header of all four dashboards**:

- Position: Top-right area, near user profile/notifications
- Icon: Moon icon for dark mode, Sun icon for light mode
- Style: Circular button with icon
- Tooltip: "Switch to Light/Dark Mode"

#### **5. Accessibility Requirements**

- Maintain **WCAG 2.1 AA contrast ratios** in both themes:
  - Normal text: 4.5:1 minimum
  - Large text: 3:1 minimum
  - UI components: 3:1 minimum
- Ensure all accent colors work on both light and dark backgrounds
- Test all interactive elements for visibility in both modes
- Provide keyboard navigation for theme toggle (Space/Enter)
- Add `aria-label` to theme toggle button

#### **6. Testing Checklist**

Before considering theme implementation complete, verify:

- [ ] Theme persists across page refreshes
- [ ] Theme persists across different dashboards
- [ ] All text is readable in both modes
- [ ] All icons are visible in both modes
- [ ] All buttons have appropriate contrast
- [ ] Hover states work in both modes
- [ ] Focus states are visible in both modes
- [ ] Status colors maintain meaning in both modes
- [ ] Shadows are appropriate for each mode
- [ ] Smooth transitions occur during theme switch
- [ ] No flash of unstyled content on page load
- [ ] System theme preference is respected on first visit
- [ ] Manual theme selection overrides system preference

#### **7. Performance Considerations**

- Load only necessary theme CSS (avoid loading both themes simultaneously)
- Use CSS custom properties for instant theme updates
- Minimize repaints during theme transitions
- Cache theme preference in localStorage
- Apply theme before first paint to avoid flash

---

## 📝 DOCUMENTATION

- Markdown files for all folders, explaining:
  - Purpose
  - Dependencies
  - Safe-to-modify zones
  - Feature description
  - **Theme system implementation and customization** (NEW)

### **NEW: THEME-SYSTEM.md**

This documentation file should include:

- Complete guide to the theme system architecture
- How to add new color tokens
- How to create theme-aware components
- Troubleshooting common theme issues
- How to test theme implementation
- Future expansion possibilities (e.g., custom themes, user-defined colors)

---

## 🚀 PHASED EXECUTION

1. **Phase 0**: Project bootstrap (folders + empty files)
2. **Phase 1**: Shared CSS & JS + **complete theme system implementation**
3. **Phase 2**: Header, Sidebar, Footer for all roles **with theme toggle**
4. **Phase 3**: Student & Faculty dashboards **with full theme support**
5. **Phase 4**: Admin dashboard + CRUD + Analytics **with full theme support**
6. **Phase 5**: Security dashboard + CCTV + Vehicle Logs **with full theme support**
7. **Phase 6**: Notifications system **with full theme support**
8. **Phase 7**: Responsive + **dark/light mode refinements and testing**
9. **Phase 8**: Documentation & handover **including theme system guide**

> After each phase, **test theme functionality thoroughly** and summarize all files created. Await confirmation to continue.

---

## ✅ EXPECTED OUTPUT

- Complete **frontend scaffold**
- Role-separated assets & components
- Fully modular CRUD & notifications
- CCTV layout ready
- Responsive design
- **Complete dark/light mode with:**
  - Persistent theme storage
  - Smooth transitions
  - All components theme-aware
  - Accessible toggle button
  - System theme detection
  - No visual glitches
- Documentation for easy future admin handover **including theme system**

---

## 🎨 THEME SYSTEM SUCCESS CRITERIA

The theme system is considered complete when:

1. ✅ Every UI element changes color appropriately in both modes
2. ✅ Theme preference persists across all pages and sessions
3. ✅ Toggle button works consistently across all dashboards
4. ✅ No flash of wrong theme on page load
5. ✅ All text maintains readability in both modes
6. ✅ Transitions are smooth and not jarring
7. ✅ System preference is detected and respected
8. ✅ All accent colors work in both modes
9. ✅ Documentation is complete and clear
10. ✅ Future admins can easily customize or extend themes

---

**Ready to execute?** This enhanced prompt now includes comprehensive dark/light mode functionality integrated into every phase of development. The theme system is modular, maintainable, and follows the same architectural principles as the rest of the system.
