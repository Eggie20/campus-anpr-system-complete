# Role Separation Guide

This document explains the role-based architecture of the Campus Security System.

---

## Overview

The system supports **4 user roles**, each with their own:

- Dashboard page
- CSS styles
- JavaScript modules
- Features and permissions

---

## Roles

### 👨‍🎓 Student

- **Dashboard**: `/assets/pages/student.html`
- **Features**: View registered vehicles, entry/exit logs, profile
- **CSS**: `/css/student/student.dashboard.css`
- **JS**: `/js/student/student.dashboard.js`

### 👨‍🏫 Faculty

- **Dashboard**: `/assets/pages/faculty.html`
- **Features**: Assigned parking slot, vehicle logs, department info
- **CSS**: Uses student.dashboard.css (shared layout)
- **JS**: `/js/faculty/faculty.dashboard.js`

### 🛡️ Admin

- **Dashboard**: `/assets/pages/admin.html`
- **Features**: CRUD for users, vehicles, cameras; analytics; system settings
- **CSS**: `/css/admin/admin.dashboard.css`
- **JS**: `/js/admin/admin.dashboard.js`

### 👮 Security

- **Dashboard**: `/assets/pages/security.html`
- **Features**: CCTV monitoring, duty timer, vehicle detection, alerts
- **CSS**: `/css/security/security.dashboard.css`
- **JS**: `/js/security/security.dashboard.js`

---

## File Organization

Each role has isolated assets:

```
/css/{role}/
/js/{role}/
/images/{role}/
/components/{role}/
```

Shared assets live in `/shared/` directories.

---

## Adding a New Role

1. Create CSS file: `/css/{role}/{role}.dashboard.css`
2. Create JS file: `/js/{role}/{role}.dashboard.js`
3. Create HTML page: `/pages/{role}.html`
4. Add link to `index.html` portal cards
5. Add mock user data to `mock-api.js`
